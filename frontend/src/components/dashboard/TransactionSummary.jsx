import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from 'lucide-react';

const TransactionSummary = ({ data = {} }) => {
  // Set default values if data is undefined
  const safeData = {
    income: data?.income || 0,
    expense: data?.expense || 0
  };

  // Format data for chart
  const chartData = [
    {
      name: 'Revenus',
      count: safeData.income,
      color: '#10B981'
    },
    {
      name: 'Dépenses',
      count: safeData.expense,
      color: '#EF4444'
    }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Transactions</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <ArrowDownCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-700">Revenus</span>
          </div>
          <p className="text-xl font-bold mt-1">{safeData.income}</p>
          <p className="text-xs text-gray-500">transactions</p>
        </div>
        
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="flex items-center">
            <ArrowUpCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-sm text-gray-700">Dépenses</span>
          </div>
          <p className="text-xl font-bold mt-1">{safeData.expense}</p>
          <p className="text-xs text-gray-500">transactions</p>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0' 
              }}
              formatter={(value) => [`${value} transactions`, 'Nombre']}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-sm text-center text-gray-500 mt-2">
        Total: {safeData.income + safeData.expense} transactions
      </p>
    </div>
  );
};

export default TransactionSummary;