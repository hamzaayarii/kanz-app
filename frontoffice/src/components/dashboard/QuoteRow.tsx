import React from 'react';
import { Eye, Download } from 'lucide-react';

export interface Quote {
  id: string;
  quoteNumber: string;
  date: string;
  amount: string;
  status: 'approved' | 'pending' | 'rejected' | 'expired';
  validUntil: string;
}

interface QuoteRowProps {
  quote: Quote;
}

const QuoteRow: React.FC<QuoteRowProps> = ({ quote }) => {
  const statusColors = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
        {quote.quoteNumber}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{quote.date}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{quote.validUntil}</td>
      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
        {quote.amount}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            statusColors[quote.status]
          }`}
        >
          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
        </span>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <button className="mr-2 text-primary-600 hover:text-primary-800">
          <Eye size={18} />
          <span className="sr-only">View quote {quote.quoteNumber}</span>
        </button>
        <button className="text-primary-600 hover:text-primary-800">
          <Download size={18} />
          <span className="sr-only">Download quote {quote.quoteNumber}</span>
        </button>
      </td>
    </tr>
  );
};

export default QuoteRow;