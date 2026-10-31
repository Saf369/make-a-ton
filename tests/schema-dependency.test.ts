import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Sales Module Database Schema & Dependency Ordering Verification', () => {
  const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');

  test('Migration files exist in expected numerical sequence', () => {
    assert.ok(fs.existsSync(migrationsDir), 'Migrations directory must exist');

    const expectedFiles = [
      '001_core_identity.sql',
      '002_catalog_plans.sql',
      '003_subscriptions.sql',
      '004_billing_finance.sql',
    ];

    for (const file of expectedFiles) {
      const fullPath = path.join(migrationsDir, file);
      assert.ok(fs.existsSync(fullPath), `Migration file ${file} must exist`);
    }
  });

  test('All foreign key dependencies resolve strictly in sequential creation order', () => {
    const migrationFiles = [
      '001_core_identity.sql',
      '002_catalog_plans.sql',
      '003_subscriptions.sql',
      '004_billing_finance.sql',
    ];

    // State tracking on a clean database
    const definedTypes = new Set<string>([
      'uuid', 'text', 'varchar', 'integer', 'numeric', 'boolean', 'date', 'timestamptz', 'jsonb'
    ]);
    const definedTables = new Map<string, Set<string>>(); // tableName -> Set<columnName>

    // Pre-populate system types
    // definedTables will be populated as migrations execute sequentially

    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      // 1. Find Enum definitions
      const enumMatches = sql.matchAll(/CREATE\s+TYPE\s+([a-z_]+)\s+AS\s+ENUM/gi);
      for (const m of enumMatches) {
        definedTypes.add(m[1].toLowerCase());
      }

      // 2. Parse CREATE TABLE statements
      const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_\.]+)\s*\(([\s\S]*?)\n\);/gi;
      let tableMatch;

      while ((tableMatch = tableRegex.exec(sql)) !== null) {
        const fullTableName = tableMatch[1].toLowerCase();
        const tableName = fullTableName.replace(/^public\./, '');
        const tableBody = tableMatch[2];

        assert.ok(!definedTables.has(tableName), `Table ${tableName} defined multiple times!`);

        const columnNames = new Set<string>();

        // Parse lines in table definition
        const lines = tableBody.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('--'));

        for (const line of lines) {
          // Check for Foreign Key references: REFERENCES target_table(target_col)
          const fkMatch = line.match(/REFERENCES\s+([a-z_\.]+)\s*\(\s*([a-z_]+)\s*\)/i);
          if (fkMatch) {
            const targetTable = fkMatch[1].toLowerCase().replace(/^public\./, '');
            const targetCol = fkMatch[2].toLowerCase();
            const isSelfRef = (targetTable === tableName);

            assert.ok(
              isSelfRef || definedTables.has(targetTable),
              `Dependency ordering violation in ${file}! Table "${tableName}" references "${targetTable}", but "${targetTable}" has not been created yet!`
            );

            if (!isSelfRef) {
              const targetColumns = definedTables.get(targetTable)!;
              assert.ok(
                targetColumns.has(targetCol),
                `Column reference violation in ${file}! Table "${tableName}" references "${targetTable}(${targetCol})", but column "${targetCol}" does not exist in "${targetTable}"!`
              );
            }
          }

          // Extract column name if this is a column definition line
          if (!line.toUpperCase().startsWith('CONSTRAINT') &&
              !line.toUpperCase().startsWith('UNIQUE') &&
              !line.toUpperCase().startsWith('CHECK') &&
              !line.toUpperCase().startsWith('PRIMARY KEY') &&
              !line.toUpperCase().startsWith('FOREIGN KEY')) {
            const colNameMatch = line.match(/^([a-z_]+)\s+([a-z_\(\), 0-9]+)/i);
            if (colNameMatch) {
              const colName = colNameMatch[1].toLowerCase();
              columnNames.add(colName);
            }
          }
        }

        definedTables.set(tableName, columnNames);
      }
    }

    // Verify all Sales Module tables are registered
    const expectedSalesTables = [
      'tax_rules',
      'discounts',
      'discount_products',
      'payment_terms',
      'quotation_templates',
      'quotation_template_items',
      'quotations',
      'quotation_items',
      'sales_orders',
      'sales_order_items',
      'invoices',
      'invoice_items',
      'discount_redemptions',
      'payments',
      'billing_runs',
      'billing_run_items',
    ];

    for (const tbl of expectedSalesTables) {
      assert.ok(definedTables.has(tbl), `Sales module table "${tbl}" must be defined`);
    }

    // Verify sales_order_items preserves all conversion snapshot attributes
    const soItemCols = definedTables.get('sales_order_items')!;
    const requiredItemCols = [
      'product_id', 'variant_id', 'tax_rule_id', 'discount_id',
      'product_name_snapshot', 'quantity', 'unit_price', 'line_total'
    ];
    for (const col of requiredItemCols) {
      assert.ok(soItemCols.has(col), `sales_order_items must contain column "${col}" for subscription conversion`);
    }
  });

  test('004_billing_finance.sql contains recurring invoice idempotency partial unique index', () => {
    const sql = fs.readFileSync(path.join(migrationsDir, '004_billing_finance.sql'), 'utf8');

    assert.match(
      sql,
      /CREATE\s+UNIQUE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?uq_recurring_subscription_period\s+ON\s+invoices\s*\(\s*subscription_id\s*,\s*billing_period_start\s*,\s*billing_period_end\s*\)\s+WHERE\s+invoice_kind\s*=\s*'RECURRING'/i,
      'Must contain partial unique index uq_recurring_subscription_period for RECURRING invoices'
    );
  });

  test('004_billing_finance.sql contains mathematical consistency check constraints', () => {
    const sql = fs.readFileSync(path.join(migrationsDir, '004_billing_finance.sql'), 'utf8');

    assert.match(
      sql,
      /CONSTRAINT\s+chk_invoice_balance_math\s+CHECK\s*\(\s*balance\s*=\s*total_amount\s*-\s*paid_amount\s*\)/i,
      'Must enforce balance = total_amount - paid_amount'
    );

    assert.match(
      sql,
      /CONSTRAINT\s+chk_invoice_paid_not_exceed_total\s+CHECK\s*\(\s*paid_amount\s*<=\s*total_amount\s*\)/i,
      'Must enforce paid_amount <= total_amount'
    );

    assert.match(
      sql,
      /CONSTRAINT\s+chk_recurring_invoice_fields\s+CHECK/i,
      'Must enforce recurring invoice non-nullable precondition'
    );
  });

  test('004_billing_finance.sql defines payment reconciliation trigger and RLS policies', () => {
    const sql = fs.readFileSync(path.join(migrationsDir, '004_billing_finance.sql'), 'utf8');

    assert.match(
      sql,
      /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+reconcile_invoice_on_payment\(\)/i,
      'Must define reconcile_invoice_on_payment trigger function'
    );

    assert.match(
      sql,
      /CREATE\s+TRIGGER\s+trg_reconcile_invoice_on_payment/i,
      'Must attach trg_reconcile_invoice_on_payment trigger to payments table'
    );

    assert.match(
      sql,
      /ALTER\s+TABLE\s+invoices\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i,
      'Must enable RLS on invoices'
    );
  });
});
