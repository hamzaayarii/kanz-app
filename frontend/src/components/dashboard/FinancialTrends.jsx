import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  Bar,
  ComposedChart
} from 'recharts';
import { motion } from 'framer-motion';

const FinancialTrends = ({ data }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'revenue', 'expenses'
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();

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
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 shadow-xl rounded-lg border border-gray-100 backdrop-blur-sm"
        >
          <p className="text-sm font-bold text-gray-700 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">
                  {entry.name === 'revenue' ? 'Revenue' : 'Expenses'}: 
                </span>
                <span className="text-sm font-medium ml-1">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
            {payload.length === 2 && (
              <div className="pt-2 mt-2 border-t border-gray-100">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-indigo-500" />
                  <span className="text-sm text-gray-600">Net Profit:</span>
                  <span className="text-sm font-medium text-indigo-600 ml-1">
                    {formatCurrency(payload[0].value - payload[1].value)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom legend
  const renderCustomizedLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex justify-center space-x-4 mb-4">
        {payload.map((entry, index) => (
          <motion.div
            key={`legend-${index}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center px-3 py-1 rounded-full cursor-pointer transition-colors ${
              activeTab === 'all' || activeTab === entry.value.toLowerCase() 
                ? 'bg-opacity-20' 
                : 'bg-opacity-10'
            }`}
            style={{ backgroundColor: `${entry.color}20` }}
            onClick={() => setActiveTab(entry.value.toLowerCase())}
          >
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs font-medium" style={{ color: entry.color }}>
              {entry.value}
            </span>
          </motion.div>
        ))}
      </div>
    );
  };

  // Custom active dot
  const renderCustomizedDot = (props) => {
    const { cx, cy, payload } = props;
    const isActive = hoveredItem && hoveredItem.name === payload.name;
    
    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={isActive ? 8 : 4}
        fill={props.stroke}
        stroke="#fff"
        strokeWidth={2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500 }}
      />
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Financial Trends</h3>
          <p className="text-sm text-gray-500">Track your business performance</p>
        </div>
        
        <div className="flex space-x-2 mt-3 md:mt-0">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-4 py-2 text-sm rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-100 text-indigo-700 shadow-indigo-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Data
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-4 py-2 text-sm rounded-xl transition-all ${
              activeTab === 'revenue'
                ? 'bg-green-100 text-green-700 shadow-green-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => navigate('/admin/daily-revenue-list')}
          >
            Revenue Details
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-4 py-2 text-sm rounded-xl transition-all ${
              activeTab === 'expenses'
                ? 'bg-red-100 text-red-700 shadow-red-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => navigate('/admin/expenses')}
          >
            Expenses Details
          </motion.button>
        </div>
      </div>
      
      <div className="h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            onMouseMove={(e) => setHoveredItem(e.activePayload?.[0]?.payload)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#E5E7EB"
            />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickMargin={10}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              tickFormatter={(value) => `${value / 1000}k`}
              tickMargin={10}
            />
            
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            
            <Legend content={renderCustomizedLegend} />
            
            {(activeTab === 'all' || activeTab === 'revenue') && (
              <>
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#10B981"
                  fill="url(#revenueGradient)"
                  strokeWidth={3}
                  activeDot={renderCustomizedDot}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  opacity={0.3}
                />
              </>
            )}
            
            {(activeTab === 'all' || activeTab === 'expenses') && (
              <>
                <Area
                  type="monotone"
                  dataKey="expenses"
                  name="Expenses"
                  stroke="#EF4444"
                  fill="url(#expensesGradient)"
                  strokeWidth={3}
                  activeDot={renderCustomizedDot}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  opacity={0.3}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
        
        {hoveredItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-100"
          >
            <p className="text-sm font-medium text-gray-700">
              {hoveredItem.name}: {formatCurrency(hoveredItem.revenue - hoveredItem.expenses)} net
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FinancialTrends;