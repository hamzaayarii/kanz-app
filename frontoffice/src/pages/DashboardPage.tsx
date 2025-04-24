import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, FileText, ClipboardList, ArrowUpRight } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import InvoiceRow, { Invoice } from '../components/dashboard/InvoiceRow';
import QuoteRow, { Quote } from '../components/dashboard/QuoteRow';

const recentInvoices: Invoice[] = [
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
];

const recentQuotes: Quote[] = [
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
];

const DashboardPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, John Doe!</p>
      </div>

      {/* Stats Section */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Invoices"
          value="12"
          icon={FileText}
          change={{ value: '+2', isPositive: true }}
        />
        <StatCard
          title="Open Quotes"
          value="4"
          icon={ClipboardList}
          change={{ value: '+1', isPositive: true }}
        />
        <StatCard
          title="Outstanding Balance"
          value="$4,320.00"
          icon={CreditCard}
          change={{ value: '-15%', isPositive: true }}
        />
        <StatCard
          title="Next Payment Due"
          value="Jul 15, 2023"
          icon={CreditCard}
        />
      </div>

      {/* Recent Invoices */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
          <Link
            to="/dashboard/invoices"
            className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
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
              {recentInvoices.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Quotes */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Recent Quotes</h2>
          <Link
            to="/dashboard/quotes"
            className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
            <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
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
              {recentQuotes.map((quote) => (
                <QuoteRow key={quote.id} quote={quote} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button className="flex flex-col items-center justify-center rounded-md border border-gray-300 p-4 hover:bg-gray-50">
            <FileText className="mb-2 h-6 w-6 text-primary-600" />
            <span className="text-sm font-medium">View Invoices</span>
          </button>
          <button className="flex flex-col items-center justify-center rounded-md border border-gray-300 p-4 hover:bg-gray-50">
            <ClipboardList className="mb-2 h-6 w-6 text-primary-600" />
            <span className="text-sm font-medium">View Quotes</span>
          </button>
          <button className="flex flex-col items-center justify-center rounded-md border border-gray-300 p-4 hover:bg-gray-50">
            <CreditCard className="mb-2 h-6 w-6 text-primary-600" />
            <span className="text-sm font-medium">Make Payment</span>
          </button>
          <button className="flex flex-col items-center justify-center rounded-md border border-gray-300 p-4 hover:bg-gray-50">
            <ClipboardList className="mb-2 h-6 w-6 text-primary-600" />
            <span className="text-sm font-medium">Request Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;