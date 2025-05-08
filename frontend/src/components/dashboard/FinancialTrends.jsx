import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const FinancialTrends = ({ data }) => {
  const [viewMode, setViewMode] = useState('both'); // 'both', 'revenue', 'expenses'
  
  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded border border-gray-200">
          <p className="text-sm font-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'revenue' ? 'Revenu: ' : 'Dépenses: '}
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </p>
          ))}
          {payload.length === 2 && (
            <p className="text-sm text-green-600 mt-1 font-medium">
              Net: {formatCurrency(payload[0].value - payload[1].value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Tendances Financières</h3>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'both'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setViewMode('both')}
          >
            Les deux
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'revenue'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setViewMode('revenue')}
          >
            Revenus
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === 'expenses'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setViewMode('expenses')}
          >
            Dépenses
          </button>
        </div>
      </div>
      
      <div className="h-64 md:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {(viewMode === 'both' || viewMode === 'revenue') && (
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenus"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
            {(viewMode === 'both' || viewMode === 'expenses') && (
              <Line
                type="monotone"
                dataKey="expenses"
                name="Dépenses"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinancialTrends;