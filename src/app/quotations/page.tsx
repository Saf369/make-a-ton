'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { QuotationDocumentModal, QuotationDocItem } from '@/components/QuotationDocumentModal';
import { FileSpreadsheet, Send, CheckCircle, Clock, Sparkles } from 'lucide-react';

const INITIAL_QUOTATIONS: QuotationDocItem[] = [
  {
    id: '#1234',
    brandName: 'MANG\nMARIO\nCARS',
    brandTagline: 'DRIVEN BY TRUST.',
    customer: 'Ray Antonio',
    company: 'Tropang True Po',
    customerId: '123456',
    contactName: 'Ray Antonio',
    address: '123 Pag-asa St., Bayanihan City 1234',
    phone: '0123 456 7890',
    title: 'Fleet Vehicle Maintenance & Telematics Package',
    projectDescription: 'Add a brief and concise description of the project, item, or service here.',
    date: '01/25/2030',
    expiryDate: '02/25/2030',
    total: '₱1,600',
    subtotal: 1500,
    tax: 100,
    others: 0,
    grandTotal: 1600,
    status: 'Sent',
    rep: 'Baby Concepcion',
    repEmail: 'hello@reallygreatsite.com',
    items: [
      { description: 'Description of item or service goes here', qty: 5, price: 100, total: 500 },
      { description: 'Description of item or service goes here', qty: 5, price: 100, total: 500 },
      { description: 'Description of item or service goes here', qty: 5, price: 100, total: 500 },
    ]
  },
  {
    id: 'QUO-2026-081',
    brandName: 'BRIGHTLOOP\nSOFTWARE\nPLATFORM',
    brandTagline: 'DRIVEN BY TRUST.',
    customer: 'Apex Global Logistics',
    company: 'Apex Global Logistics LLC',
    customerId: 'AGL-9942',
    contactName: 'Sarah Jenkins (VP Ops)',
    address: '400 Enterprise Pkwy, Suite 900, San Francisco CA 94105',
    phone: '+1 (415) 882-9011',
    title: 'Global Multi-Region SaaS Expansion',
    projectDescription: 'Annual subscription licensing covering 5 international hubs with real-time data sync, multi-currency ledger, and dedicated TAM.',
    date: '10/24/2026',
    expiryDate: '11/20/2026',
    total: '$46,200.00',
    subtotal: 42000,
    tax: 4200,
    others: 0,
    grandTotal: 46200,
    status: 'Sent',
    rep: 'Elena Rostova',
    repEmail: 'elena.r@brightloop.io',
    items: [
      { description: 'Brightloop Enterprise Cloud Platform (Annual License)', qty: 1, price: 30000, total: 30000 },
      { description: 'Dedicated Multi-Region Data Lake Connector', qty: 4, price: 2500, total: 10000 },
      { description: '24/7 SLA Concierge with Technical Account Manager', qty: 1, price: 2000, total: 2000 },
    ]
  },
  {
    id: 'QUO-2026-080',
    brandName: 'BRIGHTLOOP\nSOFTWARE\nPLATFORM',
    brandTagline: 'DRIVEN BY TRUST.',
    customer: 'Solaria Energy Corp',
    company: 'Solaria Energy Technologies',
    customerId: 'SOL-5510',
    contactName: 'Carlos Mendonca',
    address: '1800 Renewable Way, Austin TX 78701',
    phone: '+1 (512) 400-3321',
    title: 'Renewals & API Gateway Integration',
    projectDescription: 'Contract extension with high-throughput API gateway and telemetry pipelines for real-time solar grid meters.',
    date: '10/18/2026',
    expiryDate: '11/15/2026',
    total: '$18,500.00',
    subtotal: 17000,
    tax: 1500,
    others: 0,
    grandTotal: 18500,
    status: 'Approved',
    rep: 'Amina Khatib',
    repEmail: 'amina.k@brightloop.io',
    items: [
      { description: 'Core Subscription Annual Renewal (Standard Tier)', qty: 1, price: 12000, total: 12000 },
      { description: 'High-Throughput Telemetry API Gateway Add-on', qty: 1, price: 5000, total: 5000 },
    ]
  },
  {
    id: 'QUO-2026-079',
    brandName: 'BRIGHTLOOP\nSOFTWARE\nPLATFORM',
    brandTagline: 'DRIVEN BY TRUST.',
    customer: 'Horizon AI Dynamics',
    company: 'Horizon AI Labs Inc.',
    customerId: 'HAID-1088',
    contactName: 'Dr. Kevin Vance',
    address: '77 Innovation Blvd, Cambridge MA 02142',
    phone: '+1 (617) 555-8900',
    title: 'Enterprise Data Lake Sync Bundle',
    projectDescription: 'Cloud data pipeline connector for streaming ML pipeline inference and customer feature embeddings.',
    date: '10/10/2026',
    expiryDate: '11/05/2026',
    total: '$9,588.00',
    subtotal: 8800,
    tax: 788,
    others: 0,
    grandTotal: 9588,
    status: 'Draft',
    rep: 'Elena Rostova',
    repEmail: 'elena.r@brightloop.io',
    items: [
      { description: 'Pro Team 10-Seat Cloud Subscription', qty: 1, price: 5800, total: 5800 },
      { description: 'Snowflake & BigQuery Automated Sync Connector', qty: 1, price: 3000, total: 3000 },
    ]
  },
  {
    id: 'QUO-2026-078',
    brandName: 'BRIGHTLOOP\nSOFTWARE\nPLATFORM',
    brandTagline: 'DRIVEN BY TRUST.',
    customer: 'Fintech Aurora Group',
    company: 'Fintech Aurora Group Ltd',
    customerId: 'FAG-3041',
    contactName: 'Liam O’Connor',
    address: '25 Bank Street, Canary Wharf, London UK',
    phone: '+44 20 7946 0912',
    title: 'Core Banking Payment Gateway Plugin',
    projectDescription: 'Integration of PCI-DSS Level 1 compliant tokenization and multi-rail payment orchestration connector.',
    date: '10/01/2026',
    expiryDate: '10/28/2026',
    total: '$32,000.00',
    subtotal: 29000,
    tax: 3000,
    others: 0,
    grandTotal: 32000,
    status: 'Declined',
    rep: 'Marcus Brody',
    repEmail: 'marcus.b@brightloop.io',
    items: [
      { description: 'PCI-DSS Tokenization & Settlement Adapter Module', qty: 1, price: 20000, total: 20000 },
      { description: 'High Availability Disaster Recovery Cloud Pair', qty: 1, price: 9000, total: 9000 },
    ]
  }
];

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<QuotationDocItem[]>(INITIAL_QUOTATIONS);
  const [selectedQuote, setSelectedQuote] = useState<QuotationDocItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    title: '',
    total: '₱1,600',
    expiryDate: '2026-11-30',
    rep: 'Elena Rostova'
  });

  const columns: Column<QuotationDocItem>[] = [
    {
      key: 'id',
      header: 'Quote #',
      width: 'w-28',
      render: (item) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setSelectedQuote(item);
          }}
          className="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1"
          title="Click to view official quotation document"
        >
          {item.id}
        </span>
      )
    },
    {
      key: 'title',
      header: 'Proposal Title & Customer',
      render: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedQuote(item);
          }}
          className="cursor-pointer group"
        >
          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
            <span>{item.title}</span>
            <span className="text-[10px] font-medium text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
              (View Sheet)
            </span>
          </div>
          <div className="text-slate-500 text-[11px]">{item.customer}</div>
        </div>
      )
    },
    {
      key: 'rep',
      header: 'Sales Rep'
    },
    {
      key: 'expiryDate',
      header: 'Valid Until',
      render: (item) => <span className="font-mono text-slate-600 text-[11px]">{item.expiryDate}</span>
    },
    {
      key: 'total',
      header: 'Total Value',
      render: (item) => <span className="font-bold text-slate-900">{item.total}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = parseFloat(formData.total.replace(/[^0-9.]/g, '')) || 1000;
    const currency = formData.total.includes('₱') ? '₱' :
                     formData.total.includes('€') ? '€' :
                     formData.total.includes('£') ? '£' : '$';

    const tax = Math.round(cleanNum * 0.08 * 100) / 100;
    const subtotal = Math.round((cleanNum - tax) * 100) / 100;
    const formattedTotal = `${currency}${cleanNum.toLocaleString(undefined, { minimumFractionDigits: cleanNum % 1 !== 0 ? 2 : 0 })}`;

    const newQuo: QuotationDocItem = {
      id: `QUO-2026-08${quotations.length + 2}`,
      brandName: 'BRIGHTLOOP\nSOFTWARE',
      brandTagline: 'DRIVEN BY TRUST.',
      customer: formData.customer || 'Prospective Enterprise Client',
      company: formData.customer || 'Prospective Enterprise Client',
      customerId: `CUST-70${quotations.length + 1}`,
      contactName: formData.customer || 'Procurement Officer',
      address: 'Corporate Headquarters, Business District',
      phone: '+1 (800) 555-0199',
      title: formData.title || 'Annual SaaS Subscription License',
      projectDescription: `Official commercial proposal for ${formData.title || 'Annual SaaS Subscription License'}.`,
      total: formattedTotal,
      currency: currency,
      expiryDate: formData.expiryDate,
      date: new Date().toLocaleDateString('en-US'),
      status: 'Sent',
      rep: formData.rep,
      repEmail: `${formData.rep.toLowerCase().replace(/\s+/g, '.')}@brightloop.io`,
      items: [
        {
          description: formData.title || 'Enterprise Subscription Core License',
          qty: 1,
          price: subtotal,
          total: subtotal
        }
      ],
      subtotal: subtotal,
      tax: tax,
      others: 0,
      grandTotal: cleanNum
    };
    setQuotations([newQuo, ...quotations]);
    setIsModalOpen(false);
    setSelectedQuote(newQuo); // Automatically preview newly created quotation
    setFormData({ customer: '', title: '', total: '$15,000.00', expiryDate: '2026-11-30', rep: 'Elena Rostova' });
  };

  const handleMarkAccepted = (quote: QuotationDocItem) => {
    setQuotations(prev =>
      prev.map(q => q.id === quote.id ? { ...q, status: 'Approved' } : q)
    );
    setSelectedQuote(prev => prev ? { ...prev, status: 'Approved' } : null);
    alert(`Quotation ${quote.id} marked as Accepted!`);
  };

  const handleConvertToSalesOrder = (quote: QuotationDocItem) => {
    setQuotations(prev =>
      prev.map(q => q.id === quote.id ? { ...q, status: 'Approved' } : q)
    );
    setSelectedQuote(null);
    alert(`Success! Quotation ${quote.id} converted to Sales Order.`);
    router.push('/sales-orders');
  };

  const handleConvertToSubscription = (quote: QuotationDocItem) => {
    // Mark quote as Approved
    setQuotations(prev =>
      prev.map(q => q.id === quote.id ? { ...q, status: 'Approved' } : q)
    );
    setSelectedQuote(null);
    alert(`Success! Quotation ${quote.id} (${quote.customer}) has been approved and converted to an active recurring subscription!`);
    router.push('/subscriptions');
  };

  return (
    <DashboardLayout title="Quotations & Proposals" moduleName="SALES MODULE">
      <div className="space-y-6">
        <DataTable
          title="Sales Quotations & Commercial Proposals"
          subtitle="Click on any quotation row to open its customized official formal offer document sheet"
          data={quotations}
          columns={columns}
          searchPlaceholder="Search quotations..."
          searchKey="title"
          addNewLabel="New Quotation"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting quotations list as CSV...')}
          onView={(item) => setSelectedQuote(item as QuotationDocItem)}
          onEdit={(item) => {
            setSelectedQuote(item as QuotationDocItem);
          }}
          onDelete={(item) => {
            if (confirm(`Delete quote ${item.id}?`)) {
              setQuotations(quotations.filter((q) => q.id !== item.id));
              if (selectedQuote?.id === item.id) setSelectedQuote(null);
            }
          }}
          filterKey="status"
          filterOptions={[
            { label: 'Sent', value: 'Sent' },
            { label: 'Approved', value: 'Approved' },
            { label: 'Draft', value: 'Draft' },
            { label: 'Declined', value: 'Declined' }
          ]}
        />

        {/* Custom Quotation Document Sheet Modal */}
        <QuotationDocumentModal
          isOpen={Boolean(selectedQuote)}
          onClose={() => setSelectedQuote(null)}
          quotation={selectedQuote}
          onMarkAccepted={handleMarkAccepted}
          onConvertToSalesOrder={handleConvertToSalesOrder}
          onConvertToSubscription={handleConvertToSubscription}
        />

        {/* Add Quotation Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Draft New Sales Quotation"
          subtitle="Prepare an official commercial offer for a prospective or existing client"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-quote-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Create & Preview Quote
              </button>
            </>
          }
        >
          <form id="add-quote-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposal Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Enterprise Cloud Annual Subscription Deal"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Organization</label>
                <input
                  type="text"
                  required
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="e.g. Apex Global Logistics"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
                <select
                  value={formData.rep}
                  onChange={(e) => setFormData({ ...formData, rep: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Elena Rostova</option>
                  <option>Amina Khatib</option>
                  <option>Marcus Brody</option>
                  <option>Baby Concepcion</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Quotation Value</label>
                <input
                  type="text"
                  required
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  placeholder="₱1,600"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
