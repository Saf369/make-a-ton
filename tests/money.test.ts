import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateUnitPrice,
  calculateLineSubtotal,
  calculateDiscountAmount,
  calculateTaxableAmount,
  calculateTax,
  calculateLineTotal,
  calculateInvoiceLine,
  calculateInvoiceTotals,
  calculateRemainingBalance,
  isInvoiceOverdue,
  formatCurrency,
  toDecimal,
  formatDecimal,
  Decimal
} from '../src/lib/money.ts';

describe('Decimal-Safe Financial Engine powered by decimal.js (money.ts)', () => {
  it('prevents floating-point errors (0.1 + 0.2 === 0.30)', () => {
    const val1 = toDecimal(0.1);
    const val2 = toDecimal(0.2);
    const sum = val1.plus(val2);
    assert.equal(formatDecimal(sum, 2), '0.30');
  });

  it('calculates unit price correctly (basePrice + variantAdjustment)', () => {
    // Base ₹2,000 + Odoo variant adjustment ₹560 from demo scenario
    const unitPrice = calculateUnitPrice('2000.00', '560.00');
    assert.equal(unitPrice, '2560.00');

    // Without adjustment
    assert.equal(calculateUnitPrice('149.00'), '149.00');

    // Negative adjustment/discount
    assert.equal(calculateUnitPrice('500.00', '-50.00'), '450.00');
  });

  it('calculates line subtotal (unitPrice * quantity)', () => {
    // 5 seats at ₹2,560.00
    const subtotal = calculateLineSubtotal('2560.00', 5);
    assert.equal(subtotal, '12800.00');

    // 0 quantity
    assert.equal(calculateLineSubtotal('2560.00', 0), '0.00');
  });

  it('applies percentage discounts with minimum quantity eligibility', () => {
    const discountRule = {
      name: '10% Multi-Seat Discount',
      type: 'PERCENTAGE' as const,
      value: 10, // 10%
      minQuantity: 5
    };

    // Subtotal 12,800 with 5 seats -> eligible for 10% (1,280.00)
    const discountEligible = calculateDiscountAmount('12800.00', discountRule, { quantity: 5 });
    assert.equal(discountEligible, '1280.00');

    // Only 4 seats -> not eligible (< minQuantity 5)
    const discountIneligible = calculateDiscountAmount('10240.00', discountRule, { quantity: 4 });
    assert.equal(discountIneligible, '0.00');
  });

  it('applies fixed discounts and caps at subtotal', () => {
    const fixedDiscount = {
      type: 'FIXED' as const,
      value: '200.00'
    };

    assert.equal(calculateDiscountAmount('1000.00', fixedDiscount), '200.00');

    // Fixed discount cannot exceed subtotal
    assert.equal(calculateDiscountAmount('150.00', fixedDiscount), '150.00');
  });

  it('calculates taxable amount (subtotal - discount)', () => {
    const taxable = calculateTaxableAmount('12800.00', '1280.00');
    assert.equal(taxable, '11520.00');
  });

  it('calculates tax amount with precise rounding', () => {
    // 5% VAT on 11,520.00 = 576.00
    const tax5 = calculateTax('11520.00', '5.00');
    assert.equal(tax5, '576.00');

    // 18% GST on 11,520.00 = 2073.60
    const tax18 = calculateTax('11520.00', '18.00');
    assert.equal(tax18, '2073.60');
  });

  it('calculates complete invoice line end-to-end', () => {
    const line = calculateInvoiceLine({
      basePrice: '2000.00',
      variantAdjustment: '560.00',
      quantity: 5,
      discountRule: { type: 'PERCENTAGE', value: 10, minQuantity: 5 },
      taxRatePercent: '5.00'
    });

    assert.equal(line.unitPrice, '2560.00');
    assert.equal(line.lineSubtotal, '12800.00');
    assert.equal(line.discountAmount, '1280.00');
    assert.equal(line.taxableAmount, '11520.00');
    assert.equal(line.taxAmount, '576.00');
    assert.equal(line.lineTotal, '12096.00');
  });

  it('aggregates invoice totals across multiple lines', () => {
    const line1 = calculateInvoiceLine({
      basePrice: '2000.00',
      variantAdjustment: '560.00',
      quantity: 5,
      discountRule: { type: 'PERCENTAGE', value: 10, minQuantity: 5 },
      taxRatePercent: '5.00'
    });

    const line2 = calculateInvoiceLine({
      basePrice: '100.00',
      quantity: 2,
      taxRatePercent: '5.00'
    });

    const totals = calculateInvoiceTotals([line1, line2]);
    assert.equal(totals.subtotal, '13000.00');
    assert.equal(totals.discountTotal, '1280.00');
    assert.equal(totals.taxableTotal, '11720.00');
    assert.equal(totals.taxTotal, '586.00');
    assert.equal(totals.invoiceTotal, '12306.00');
  });

  it('calculates remaining balance correctly on partial and full payments', () => {
    const total = '12306.00';

    // Partial payment of 5,000.00
    const partialBal = calculateRemainingBalance(total, '5000.00');
    assert.equal(partialBal, '7306.00');

    // Full payment of 12,306.00
    const settledBal = calculateRemainingBalance(total, '12306.00');
    assert.equal(settledBal, '0.00');

    // Overpayment clamped to 0.00
    assert.equal(calculateRemainingBalance(total, '15000.00'), '0.00');
  });

  it('evaluates overdue status accurately', () => {
    const yesterday = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);

    // Past due with remaining balance -> true
    assert.equal(isInvoiceOverdue(yesterday, '100.00', false), true);

    // Past due but balance is 0.00 -> false
    assert.equal(isInvoiceOverdue(yesterday, '0.00', false), false);

    // Future due date -> false
    assert.equal(isInvoiceOverdue(tomorrow, '100.00', false), false);

    // Past due with balance, but invoice is cancelled -> false
    assert.equal(isInvoiceOverdue(yesterday, '100.00', true), false);
  });

  it('formats INR currency correctly according to Indian numbering convention', () => {
    const formatted = formatCurrency('125000.00', 'INR', 'en-IN');
    // In en-IN, 125000 is formatted as ₹1,25,000.00
    assert.ok(formatted.includes('1,25,000.00'));
  });
});
