import React from 'react';
import { CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';

const InvoiceSummary = ({ data }) => {
  const { paid = 0, unpaid = 0, overdue = 0, draft = 0 } = data || {};
  
  const invoiceTypes = [
    {
      name: 'Paid',
      value: paid,
      icon: <CheckCircle size={18} />,
      color: 'text-success',
      bgColor: 'bg-light-success'
    },
    {
      name: 'Due soon',
      value: unpaid,
      icon: <Clock size={18} />,
      color: 'text-warning',
      bgColor: 'bg-light-warning'
    },
    {
      name: 'Overdue',
      value: overdue,
      icon: <AlertTriangle size={18} />,
      color: 'text-danger',
      bgColor: 'bg-light-danger'
    },
    {
      name: 'Draft',
      value: draft,
      icon: <FileText size={18} />,
      color: 'text-secondary',
      bgColor: 'bg-light-secondary'
    }
  ];

  const totalInvoices = paid + unpaid + overdue + draft;

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0 fw-semibold">Invoice Status</h5>
      </div>
      <div className="card-body">
        <div className="d-flex flex-column">
          {invoiceTypes.map((invoice, index) => (
            <div key={index} className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center">
                <div className={`${invoice.bgColor} p-2 rounded me-2`}>
                  <span className={invoice.color}>{invoice.icon}</span>
                </div>
                <span>{invoice.name}</span>
              </div>
              <div className="d-flex align-items-center">
                <strong>{invoice.value}</strong>
                <small className="text-muted ms-2">
                  {totalInvoices > 0 
                    ? `${Math.round((invoice.value / totalInvoices) * 100)}%` 
                    : '0%'}
                </small>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex justify-content-between">
            <span className="text-muted">Total invoices</span>
            <strong>{totalInvoices}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;