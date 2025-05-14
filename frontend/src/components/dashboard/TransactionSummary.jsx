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
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

const TransactionSummary = ({ data }) => {
  const { income = 0, expense = 0 } = data || {};
  const totalTransactions = income + expense;
  
  const chartData = [
    { name: 'Income', count: income, color: '#10B981' },
    { name: 'Expenses', count: expense, color: '#EF4444' }
  ];

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0 fw-semibold">Transactions</h5>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-between mb-4">
          <div className="d-flex align-items-center">
            <div className="bg-light-success p-2 rounded-circle me-2">
              <ArrowDownCircle size={20} className="text-success" />
            </div>
            <div>
              <span className="text-muted small">Income</span>
              <h5 className="fw-bold mb-0">{income}</h5>
            </div>
          </div>
          
          <div className="d-flex align-items-center">
            <div className="bg-light-danger p-2 rounded-circle me-2">
              <ArrowUpCircle size={20} className="text-danger" />
            </div>
            <div>
              <span className="text-muted small">Expenses</span>
              <h5 className="fw-bold mb-0">{expense}</h5>
            </div>
          </div>
        </div>
        
        <div style={{ height: "140px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '4px' }}
                formatter={(value) => [`${value} transactions`, 'Count']}
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
        
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Total transactions</span>
            <span className="fw-bold">{totalTransactions}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary;