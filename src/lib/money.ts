/**
 * Decimal-Safe Financial Calculation Engine for Brightloop Hub
 * Powered by decimal.js as specified in BRIGHTLOOP_MASTER_IMPLEMENTATION_PLAN.md Section 2.2 & 7.7
 * 
 * Rules:
 * 1. Uses decimal.js for arbitrary-precision decimal arithmetic.
 * 2. Explicit ROUND_HALF_UP rounding policy for currency & tax calculations.
 * 3. Exact matching of PostgreSQL NUMERIC data types.
 * 4. Immutable snapshots for invoice lines, discounts, taxes, and balances.
 */

import Decimal from 'decimal.js';

// Configure Decimal globally for financial operations: 28 digits precision, Half-Up rounding
Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9,
  toExpPos: 28
});

export { Decimal };

export interface DiscountRule {
  id?: string;
  name?: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number | string | Decimal; // e.g. 10 for 10%, or 50.00 for ₹50.00
  scope?: 'PRODUCT' | 'SUBSCRIPTION';
  minQuantity?: number;
  minAmount?: number | string | Decimal;
  validFrom?: string | Date;
  validUntil?: string | Date;
  usageLimit?: number;
  currentUsage?: number;
}

export interface InvoiceLineInput {
  basePrice: number | string | Decimal;
  variantAdjustment?: number | string | Decimal;
  quantity: number;
  discountRule?: DiscountRule;
  taxRatePercent?: number | string | Decimal; // e.g. 5.0 for 5%, 18.0 for 18% GST
}

export interface CalculatedLine {
  unitPrice: string;       // basePrice + variantAdjustment
  lineSubtotal: string;    // unitPrice * quantity
  discountAmount: string;  // eligible discount applied
  taxableAmount: string;   // lineSubtotal - discountAmount
  taxAmount: string;       // taxableAmount * taxRate
  lineTotal: string;       // taxableAmount + taxAmount
}

export interface InvoiceTotals {
  subtotal: string;
  discountTotal: string;
  taxableTotal: string;
  taxTotal: string;
  invoiceTotal: string;
}

/**
 * Parses any number, string (with currency symbols or commas), or Decimal into a sanitized Decimal instance.
 */
export function toDecimal(val: number | string | Decimal | null | undefined): Decimal {
  if (val === null || val === undefined || val === '') {
    return new Decimal(0);
  }
  if (val instanceof Decimal) {
    return val;
  }
  if (typeof val === 'number') {
    return new Decimal(val);
  }

  let str = String(val).trim();
  // Strip currency symbols (₹, $, €, £, OMR, etc.), commas, and extra spaces
  str = str.replace(/[$,₹€£\s]/g, '');
  if (!str || isNaN(Number(str))) {
    return new Decimal(0);
  }

  try {
    return new Decimal(str);
  } catch {
    return new Decimal(0);
  }
}

/**
 * Formats a Decimal to an exact 2-decimal string with ROUND_HALF_UP.
 */
export function formatDecimal(val: Decimal | number | string, decimals = 2): string {
  const d = toDecimal(val);
  return d.toFixed(decimals, Decimal.ROUND_HALF_UP);
}

/**
 * 1. unit_price = base_product_price + selected_variant_adjustments
 */
export function calculateUnitPrice(
  basePrice: number | string | Decimal,
  variantAdjustment: number | string | Decimal = 0
): string {
  const base = toDecimal(basePrice);
  const adj = toDecimal(variantAdjustment);
  return formatDecimal(base.plus(adj), 2);
}

/**
 * 2. line_subtotal = unit_price × quantity
 */
export function calculateLineSubtotal(
  unitPrice: number | string | Decimal,
  quantity: number
): string {
  if (quantity <= 0) return '0.00';
  const unit = toDecimal(unitPrice);
  const qty = new Decimal(Math.floor(quantity));
  return formatDecimal(unit.times(qty), 2);
}

/**
 * 3. calculateDiscountAmount: Applies eligible discount based on scope, min quantity, dates, and cap.
 */
export function calculateDiscountAmount(
  lineSubtotal: number | string | Decimal,
  discountRule?: DiscountRule,
  options?: {
    quantity?: number;
    referenceDate?: Date | string;
  }
): string {
  if (!discountRule) return '0.00';

  const subtotal = toDecimal(lineSubtotal);
  if (subtotal.lte(0)) return '0.00';

  // Check minimum quantity threshold
  if (discountRule.minQuantity && options?.quantity) {
    if (options.quantity < discountRule.minQuantity) {
      return '0.00';
    }
  }

  // Check minimum amount threshold
  if (discountRule.minAmount) {
    const minAmt = toDecimal(discountRule.minAmount);
    if (subtotal.lt(minAmt)) {
      return '0.00';
    }
  }

  // Check date range validity
  if (options?.referenceDate) {
    const ref = new Date(options.referenceDate).getTime();
    if (discountRule.validFrom && ref < new Date(discountRule.validFrom).getTime()) {
      return '0.00';
    }
    if (discountRule.validUntil && ref > new Date(discountRule.validUntil).getTime()) {
      return '0.00';
    }
  }

  // Check usage limit cap
  if (
    discountRule.usageLimit !== undefined &&
    discountRule.currentUsage !== undefined &&
    discountRule.currentUsage >= discountRule.usageLimit
  ) {
    return '0.00';
  }

  let discount = new Decimal(0);

  if (discountRule.type === 'PERCENTAGE') {
    const percent = toDecimal(discountRule.value); // e.g. 10 for 10%
    // (subtotal * percent) / 100
    discount = subtotal.times(percent).dividedBy(100);
  } else {
    // FIXED amount discount
    discount = toDecimal(discountRule.value);
  }

  // Discount cannot exceed subtotal or be negative
  if (discount.gt(subtotal)) {
    discount = subtotal;
  }
  if (discount.lt(0)) {
    discount = new Decimal(0);
  }

  return formatDecimal(discount, 2);
}

/**
 * 4. taxable_amount = line_subtotal − discount
 */
export function calculateTaxableAmount(
  lineSubtotal: number | string | Decimal,
  discountAmount: number | string | Decimal = 0
): string {
  const subtotal = toDecimal(lineSubtotal);
  const discount = toDecimal(discountAmount);
  const taxable = subtotal.minus(discount);
  return formatDecimal(taxable.gt(0) ? taxable : new Decimal(0), 2);
}

/**
 * 5. tax = taxable_amount × tax_rate
 */
export function calculateTax(
  taxableAmount: number | string | Decimal,
  taxRatePercent: number | string | Decimal = 0
): string {
  const taxable = toDecimal(taxableAmount);
  if (taxable.lte(0)) return '0.00';

  const rate = toDecimal(taxRatePercent); // e.g. 5.0 for 5%, 18.0 for 18%
  if (rate.lte(0)) return '0.00';

  const tax = taxable.times(rate).dividedBy(100);
  return formatDecimal(tax, 2);
}

/**
 * 6. line_total = taxable_amount + tax
 */
export function calculateLineTotal(
  taxableAmount: number | string | Decimal,
  taxAmount: number | string | Decimal
): string {
  const taxable = toDecimal(taxableAmount);
  const tax = toDecimal(taxAmount);
  return formatDecimal(taxable.plus(tax), 2);
}

/**
 * Full line calculation pipeline for an invoice or quotation line item.
 */
export function calculateInvoiceLine(input: InvoiceLineInput): CalculatedLine {
  const unitPrice = calculateUnitPrice(input.basePrice, input.variantAdjustment);
  const lineSubtotal = calculateLineSubtotal(unitPrice, input.quantity);
  const discountAmount = calculateDiscountAmount(lineSubtotal, input.discountRule, {
    quantity: input.quantity
  });
  const taxableAmount = calculateTaxableAmount(lineSubtotal, discountAmount);
  const taxAmount = calculateTax(taxableAmount, input.taxRatePercent);
  const lineTotal = calculateLineTotal(taxableAmount, taxAmount);

  return {
    unitPrice,
    lineSubtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    lineTotal
  };
}

/**
 * 7. invoice_total = sum(line_total) and aggregates
 */
export function calculateInvoiceTotals(lines: CalculatedLine[]): InvoiceTotals {
  let subtotal = new Decimal(0);
  let discountTotal = new Decimal(0);
  let taxableTotal = new Decimal(0);
  let taxTotal = new Decimal(0);
  let invoiceTotal = new Decimal(0);

  for (const line of lines) {
    subtotal = subtotal.plus(toDecimal(line.lineSubtotal));
    discountTotal = discountTotal.plus(toDecimal(line.discountAmount));
    taxableTotal = taxableTotal.plus(toDecimal(line.taxableAmount));
    taxTotal = taxTotal.plus(toDecimal(line.taxAmount));
    invoiceTotal = invoiceTotal.plus(toDecimal(line.lineTotal));
  }

  return {
    subtotal: formatDecimal(subtotal, 2),
    discountTotal: formatDecimal(discountTotal, 2),
    taxableTotal: formatDecimal(taxableTotal, 2),
    taxTotal: formatDecimal(taxTotal, 2),
    invoiceTotal: formatDecimal(invoiceTotal, 2)
  };
}

/**
 * 8. balance = invoice_total − sum(successful payments)
 */
export function calculateRemainingBalance(
  invoiceTotal: number | string | Decimal,
  successfulPaymentsTotal: number | string | Decimal
): string {
  const total = toDecimal(invoiceTotal);
  const paid = toDecimal(successfulPaymentsTotal);
  const bal = total.minus(paid);
  return formatDecimal(bal.gt(0) ? bal : new Decimal(0), 2);
}

/**
 * 9. overdue = due_date < today AND balance > 0 AND invoice is not cancelled
 */
export function isInvoiceOverdue(
  dueDate: string | Date,
  balance: number | string | Decimal,
  isCancelled: boolean = false,
  referenceDate?: string | Date
): boolean {
  if (isCancelled) return false;

  const bal = toDecimal(balance);
  if (bal.lte(0)) return false;

  const dueTime = new Date(dueDate).setHours(23, 59, 59, 999);
  const nowTime = referenceDate ? new Date(referenceDate).getTime() : Date.now();

  return dueTime < nowTime;
}

/**
 * Safe currency formatter with localized symbol support (defaults to INR ₹ as per demo contract).
 */
export function formatCurrency(
  amount: number | string | Decimal,
  currencyCode: string = 'INR',
  locale = 'en-IN'
): string {
  const dec = toDecimal(amount);
  const num = dec.toNumber();

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  } catch {
    const symbol = currencyCode === 'INR' ? '₹' : currencyCode === 'USD' ? '$' : `${currencyCode} `;
    return `${symbol}${formatDecimal(dec, 2)}`;
  }
}
