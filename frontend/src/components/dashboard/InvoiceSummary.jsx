import React from 'react';
import { CheckCircleIcon, ClockIcon, AlertCircleIcon, PencilIcon } from 'lucide-react';

const InvoiceSummary = ({ data }) => {
  // Calculate total invoices
  const totalInvoices = data.paid + data.unpaid + data.overdue + data.draft;

  // Invoice status categories with their display info
  const statusCategories = [
    {
      name: 'Payées',
      count: data.paid,
      icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      name: 'En attente',
      count: data.unpaid,
      icon: <ClockIcon className="h-5 w-5 text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      name: 'En retard',
      count: data.overdue,
      icon: <AlertCircleIcon className="h-5 w-5 text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      name: 'Brouillons',
      count: data.draft,
      icon: <PencilIcon className="h-5 w-5 text-gray-500" />,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700'
    }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">État des Factures</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {statusCategories.map((category, index) => (
          <div 
            key={index} 
            className={`${category.bgColor} p-3 rounded-lg flex flex-col`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${category.textColor}`}>
                {category.name}
              </span>
              {category.icon}
            </div>
            <p className="text-xl font-bold">{category.count}</p>
            <p className="text-xs text-gray-500">
              {totalInvoices > 0 
                ? `${Math.round((category.count / totalInvoices) * 100)}% du total` 
                : '0% du total'}
            </p>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total des Factures</span>
          <span className="text-lg font-semibold">{totalInvoices}</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSummary;