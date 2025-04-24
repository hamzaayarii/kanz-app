import React, { useState } from 'react';
import { Search, Filter, Download, FileText } from 'lucide-react';
import InvoiceRow, { Invoice } from '../components/dashboard/InvoiceRow';

const allInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2023-001',
    date: 'May 15, 2023',
    amount: '$1,250.00',
    status: 'paid',
    dueDate: 'Jun 15, 2023',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2023-002',
    date: 'Jun 2, 2023',
    amount: '$3,475.00',
    status: 'pending',
    dueDate: 'Jul 2, 2023',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2023-003',
    date: 'Jun 18, 2023',
    amount: '$890.00',
    status: 'overdue',
    dueDate: 'Jul 18, 2023',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2023-004',
    date: 'Jul 5, 2023',
    amount: '$2,150.00',
    status: 'paid',
    dueDate: 'Aug 5, 2023',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2023-005',
    date: 'Jul 20, 2023',
    amount: '$4,325.00',
    status: 'pending',
    dueDate: 'Aug 20, 2023',
  },
  {
    id: '6',
    invoiceNumber: 'INV-2023-006',
    date: 'Aug 8, 2023',
    amount: '$1,675.00',
    status: 'pending',
    dueDate: 'Sep 8, 2023',
  },
  {
    id: '7',
    invoiceNumber: 'INV-2023-007',
    date: 'Aug 25, 2023',
    amount: '$950.00',
    status: 'paid',
    dueDate: 'Sep 25, 2023',
  },
  {
    id: '8',
    invoiceNumber: 'INV-2023-008',
    date: 'Sep 12, 2023',
    amount: '$3,200.00',
    status: 'paid',
    dueDate: 'Oct 12, 2023',
  },
];

const InvoicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredInvoices = allInvoices.filter((invoice) => {
    const matchesSearch = invoice.invoiceNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-gray-600">View and manage all your invoices</p>
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
            placeholder="Search invoices..."
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
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
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

      {/* Invoices Table */}
      {filteredInvoices.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Invoice Number
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
                  Due Date
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
              {filteredInvoices.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-12">
          <FileText className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Your invoices will appear here once created'}
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;