'use client';

import React from 'react';
import { Printer, CheckCircle, RefreshCw, X, ArrowRight, Download, Send } from 'lucide-react';

export interface QuotationDocItem {
  id: string;
  brandName?: string;
  brandTagline?: string;
  customer: string;
  company?: string;
  customerId?: string;
  contactName?: string;
  address?: string;
  phone?: string;
  title: string;
  projectDescription?: string;
  date?: string;
  expiryDate: string;
  total: string;
  currency?: string;
  status: string;
  rep: string;
  repEmail?: string;
  items?: Array<{
    description: string;
    qty: number;
    price: number;
    total: number;
  }>;
  subtotal?: number;
  tax?: number;
  others?: number;
  grandTotal?: number;
}

interface QuotationDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: QuotationDocItem | null;
  onConvertToSubscription?: (quote: QuotationDocItem) => void;
  onConvertToSalesOrder?: (quote: QuotationDocItem) => void;
  onMarkAccepted?: (quote: QuotationDocItem) => void;
  onApprove?: (quote: QuotationDocItem) => void;
}

export const QuotationDocumentModal: React.FC<QuotationDocumentModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onConvertToSubscription,
  onConvertToSalesOrder,
  onMarkAccepted,
  onApprove,
}) => {
  if (!isOpen || !quotation) return null;

  // Resolve currency dynamically from data
  const currency = quotation.currency || (
    quotation.total?.includes('₱') ? '₱' :
    quotation.total?.includes('$') ? '$' :
    quotation.total?.includes('€') ? '€' :
    quotation.total?.includes('£') ? '£' : '$'
  );

  const formatMoney = (val: number) => {
    return `${currency}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Derive items matching quotation data if not provided
  const items = quotation.items && quotation.items.length > 0 ? quotation.items : [
    {
      description: quotation.title || 'Enterprise Subscription Services',
      qty: 1,
      price: parseFloat(quotation.total.replace(/[^0-9.]/g, '')) || 1000,
      total: parseFloat(quotation.total.replace(/[^0-9.]/g, '')) || 1000,
    }
  ];

  const subtotal = quotation.subtotal ?? items.reduce((acc, it) => acc + it.total, 0);
  const tax = quotation.tax ?? 0;
  const others = quotation.others ?? 0;
  const grandTotal = quotation.grandTotal ?? (subtotal + tax + others);

  const handlePrint = () => {
    window.print();
  };

  const formattedQuoteNumber = quotation.id.startsWith('#') ? quotation.id : `#${quotation.id}`;
  const brandTitle = quotation.brandName || (quotation.id === '#1234' ? 'MANG\nMARIO\nCARS' : 'BRIGHTLOOP\nSOFTWARE');
  const brandTagline = quotation.brandTagline || 'DRIVEN BY TRUST.';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:max-w-none">
        {/* Modal Action Header (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-amber-300 font-semibold bg-white/10 px-2 py-0.5 rounded">
              {quotation.id}
            </span>
            <span className="text-xs text-slate-300 font-medium">Formal Commercial Quotation</span>
            <span className="text-[11px] text-slate-400 font-mono">({quotation.customer})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {onMarkAccepted && quotation.status !== 'Approved' && (
              <button
                onClick={() => onMarkAccepted(quotation)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark as Accepted</span>
              </button>
            )}

            {onConvertToSalesOrder && (
              <button
                onClick={() => onConvertToSalesOrder(quotation)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
              >
                <span>Convert to Sales Order</span>
              </button>
            )}

            {onConvertToSubscription && (
              <button
                onClick={() => onConvertToSubscription(quotation)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Turn into Subscription</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-2"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* EXACT QUOTATION DOCUMENT REPRODUCTION (Print & Screen View)    */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white font-sans print:p-8" id="quotation-print-area">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-6 pb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 font-serif leading-none whitespace-pre-line">
                {brandTitle}
              </h1>
              <p className="text-[10px] font-bold tracking-widest text-slate-600 mt-1 uppercase">
                {brandTagline}
              </p>
            </div>

            <div className="text-right">
              <h2 className="text-2xl sm:text-3xl font-normal tracking-widest text-slate-950 font-serif uppercase">
                QUOTATION
              </h2>
            </div>
          </div>

          {/* Quotation Metadata Row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs font-medium text-slate-800 pt-2">
            <div className="space-y-1">
              <div>
                <span className="font-semibold text-slate-950">Quotation No:</span> {formattedQuoteNumber}
              </div>
              <div>
                <span className="font-semibold text-slate-950">Customer ID:</span> {quotation.customerId || `CUST-${quotation.id.replace(/[^0-9]/g, '') || '101'}`}
              </div>
            </div>

            <div className="space-y-1 sm:text-right">
              <div>
                <span className="font-semibold text-slate-950">Date:</span> {quotation.date || '10/24/2026'}
              </div>
              <div>
                <span className="font-semibold text-slate-950">Valid Until:</span> {quotation.expiryDate}
              </div>
            </div>
          </div>

          {/* Customer Address Info */}
          <div className="mt-6 text-xs text-slate-800 space-y-0.5">
            <p className="font-bold text-sm text-slate-950">{quotation.contactName || quotation.customer}</p>
            <p className="font-medium text-slate-700">{quotation.company || quotation.customer}</p>
            {quotation.address && <p className="text-slate-600">{quotation.address}</p>}
            {quotation.phone && <p className="text-slate-600">{quotation.phone}</p>}
          </div>

          {/* Heavy Horizontal Divider (Solid Black Bar) */}
          <div className="w-full h-2.5 bg-black my-6" />

          {/* Project Description Block */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8 pb-8 text-xs">
            <div className="font-bold text-slate-950 sm:w-44 shrink-0 text-sm">
              Project Description
            </div>
            <div className="text-slate-700 leading-relaxed text-xs">
              {quotation.projectDescription || quotation.title}
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left font-bold text-slate-950 pb-2.5 w-1/2">Description</th>
                <th className="text-center font-bold text-slate-950 pb-2.5 w-16">Qty</th>
                <th className="text-right font-bold text-slate-950 pb-2.5 w-24">Price</th>
                <th className="text-right font-bold text-slate-950 pb-2.5 w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((row, idx) => (
                <tr key={idx} className="text-slate-800">
                  <td className="py-3.5 pr-4 leading-normal">{row.description}</td>
                  <td className="py-3.5 px-2 text-center font-mono">{row.qty}</td>
                  <td className="py-3.5 px-2 text-right font-mono">{formatMoney(row.price)}</td>
                  <td className="py-3.5 pl-2 text-right font-mono font-semibold text-slate-950">{formatMoney(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Horizontal Line under table */}
          <div className="w-full border-t border-black mt-2" />

          {/* Financial Summary Block */}
          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700 font-medium">
                <span>Subtotal</span>
                <span className="font-mono text-slate-950">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 font-medium">
                <span>Value-Added Tax</span>
                <span className="font-mono text-slate-950">{formatMoney(tax)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 font-medium">
                <span>Others</span>
                <span className="font-mono text-slate-950">{formatMoney(others)}</span>
              </div>

              {/* Solid Black Total Box (Exact match to uploaded image) */}
              <div className="bg-black text-white px-3.5 py-2 font-bold flex items-center justify-between text-sm shadow-xs">
                <span>Total</span>
                <span className="font-mono">{formatMoney(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer & Signature Section */}
          <div className="mt-14 pt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-8 text-xs">
            {/* Left: Contact rep and thank you note */}
            <div className="space-y-4 max-w-sm">
              <p className="text-slate-600 italic leading-relaxed">
                If you have any questions concerning this quotation, please contact{' '}
                <strong className="text-slate-950 not-italic font-bold">{quotation.rep || 'Elena Rostova'}</strong> at{' '}
                <span className="text-slate-950 not-italic font-medium">
                  {quotation.repEmail || `${(quotation.rep || 'sales').toLowerCase().replace(/\s+/g, '.')}@brightloop.io`}
                </span>
              </p>
              <p className="font-bold text-slate-950 text-sm">
                Thank you for your business!
              </p>
            </div>

            {/* Right: Formal Acceptance & Signature Line */}
            <div className="sm:text-right space-y-5 sm:min-w-[260px]">
              <p className="font-medium text-slate-700">
                Please confirm your<br />
                acceptance of this quote:
              </p>
              <div className="pt-6 border-b border-black w-full" />
              <p className="text-[10px] text-slate-600 italic">
                Signature over printed name and date
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
