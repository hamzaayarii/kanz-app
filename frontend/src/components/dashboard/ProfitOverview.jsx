import React from 'react';
import { DollarSignIcon } from 'lucide-react';

const ProfitOverview = ({ data }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Determine if profit is positive or negative
  const isPositiveMonth = data.thisMonth >= 0;
  const isPositiveYear = data.thisYear >= 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Profit Net</h3>
        <div className={`p-2 ${isPositiveYear ? 'bg-green-100' : 'bg-red-100'} rounded-full`}>
          <DollarSignIcon className={`h-5 w-5 ${isPositiveYear ? 'text-green-600' : 'text-red-600'}`} />
        </div>
      </div>
      
      <div className="mb-2">
        <p className={`text-2xl font-bold ${isPositiveMonth ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(data.thisMonth)}
        </p>
        <p className="text-sm text-gray-500">Ce mois</p>
      </div>
      
      <div>
        <p className={`text-lg font-semibold ${isPositiveYear ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(data.thisYear)}
          <span className="text-sm font-normal text-gray-500 ml-1">cette année</span>
        </p>
      </div>
    </div>
  );
};

export default ProfitOverview;