import React from 'react';
import { Download, Eye } from 'lucide-react';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
}

interface InvoiceRowProps {
  invoice: Invoice;
}

const InvoiceRow: React.FC<InvoiceRowProps> = ({ invoice }) => {
  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    overdue: 'bg-red-100 text-red-800',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
        {invoice.invoiceNumber}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{invoice.date}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{invoice.dueDate}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
        {invoice.amount}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            statusColors[invoice.status]
          }`}
        >
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </span>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <button className="mr-2 text-primary-600 hover:text-primary-800">
          <Eye size={18} />
          <span className="sr-only">View invoice {invoice.invoiceNumber}</span>
        </button>
        <button className="text-primary-600 hover:text-primary-800">
          <Download size={18} />
          <span className="sr-only">Download invoice {invoice.invoiceNumber}</span>
        </button>
      </td>
    </tr>
  );
};

export default InvoiceRow;