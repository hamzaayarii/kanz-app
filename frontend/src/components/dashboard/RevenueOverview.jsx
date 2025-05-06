import React from 'react';
import { TrendingUpIcon } from 'lucide-react';

const RevenueOverview = ({ data }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Revenus</h3>
        <div className="p-2 bg-blue-100 rounded-full">
          <TrendingUpIcon className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      
      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(data.thisMonth)}
        </p>
        <p className="text-sm text-gray-500">Ce mois</p>
      </div>
      
      <div>
        <p className="text-lg font-semibold text-gray-800">
          {formatCurrency(data.thisYear)}
          <span className="text-sm font-normal text-gray-500 ml-1">cette année</span>
        </p>
      </div>
    </div>
  );
};

export default RevenueOverview;