import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ArrowDownCircleIcon, ArrowUpCircleIcon } from 'lucide-react';

const TransactionSummary = ({ data = {} }) => {
  const safeData = {
    income: data?.income || 0,
    expense: data?.expense || 0
  };
  
  const chartData = [
    { name: 'Revenus', count: safeData.income, color: '#10B981' },
    { name: 'Dépenses', count: safeData.expense, color: '#EF4444' }
  ];
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Transactions</h3>
      
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-green-50">
            <ArrowDownCircleIcon className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Revenus</p>
            <p className="text-xl font-bold">{safeData.income}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-red-50">
            <ArrowUpCircleIcon className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Dépenses</p>
            <p className="text-xl font-bold">{safeData.expense}</p>
          </div>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px' }}
              formatter={(value) => [`${value} transactions`, 'Nombre']}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-xs text-center text-gray-500 mt-2">
        Total: {safeData.income + safeData.expense} transactions
      </p>
    </div>
  );
};

export default TransactionSummary;