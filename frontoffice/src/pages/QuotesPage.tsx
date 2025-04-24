import React, { useState } from 'react';
import { Search, Filter, Download, ClipboardList } from 'lucide-react';
import QuoteRow, { Quote } from '../components/dashboard/QuoteRow';

const allQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'QUO-2023-001',
    date: 'Apr 28, 2023',
    amount: '$2,750.00',
    status: 'approved',
    validUntil: 'May 28, 2023',
  },
  {
    id: '2',
    quoteNumber: 'QUO-2023-002',
    date: 'May 10, 2023',
    amount: '$5,120.00',
    status: 'pending',
    validUntil: 'Jun 10, 2023',
  },
  {
    id: '3',
    quoteNumber: 'QUO-2023-003',
    date: 'Jun 5, 2023',
    amount: '$1,875.00',
    status: 'rejected',
    validUntil: 'Jul 5, 2023',
  },
  {
    id: '4',
    quoteNumber: 'QUO-2023-004',
    date: 'Jun 22, 2023',
    amount: '$3,450.00',
    status: 'expired',
    validUntil: 'Jul 22, 2023',
  },
  {
    id: '5',
    quoteNumber: 'QUO-2023-005',
    date: 'Jul 8, 2023',
    amount: '$6,200.00',
    status: 'approved',
    validUntil: 'Aug 8, 2023',
  },
  {
    id: '6',
    quoteNumber: 'QUO-2023-006',
    date: 'Jul 25, 2023',
    amount: '$1,950.00',
    status: 'pending',
    validUntil: 'Aug 25, 2023',
  },
];

const QuotesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredQuotes = allQuotes.filter((quote) => {
    const matchesSearch = quote.quoteNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
        <p className="text-gray-600">View and manage all your quotes</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative max-w-xs flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <div>
            <select
              className="block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </button>
          <button className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quotes Table */}
      {filteredQuotes.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Quote Number
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Valid Until
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Amount
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredQuotes.map((quote) => (
                <QuoteRow key={quote.id} quote={quote} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12">
          <ClipboardList className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No quotes found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Your quotes will appear here once created'}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuotesPage;