import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  Building, 
  FileText, 
  CreditCard,
  BarChart,
  PieChart,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import BusinessSelector from '../../components/dashboard/BusinessSelector';

// Modern Stat Card Component
const StatCard = ({ title, value, subtitle, icon, iconColor, trend, trendValue }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4" style={{ borderLeftColor: iconColor }}>
      <div className="absolute top-2 right-2 text-opacity-80" style={{ color: iconColor }}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            <span className="ml-1">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Invoice Status Card Component
const InvoiceStatusCard = ({ title, value, color, icon }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4 hover:shadow-md transition-shadow duration-300">
      <div className="rounded-full p-3" style={{ backgroundColor: `${color}20` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ activity }) => {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'transaction': return <DollarSign size={16} className="text-blue-500" />;
      case 'invoice': return <FileText size={16} className="text-purple-500" />;
      default: return <Activity size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
      <div className="bg-gray-100 rounded-full p-2">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{activity.title}</p>
        <p className="text-xs text-gray-500">{activity.description}</p>
      </div>
      <div className="text-xs text-gray-400">{activity.time}</div>
    </div>
  );
};

const ModernDashboard = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    revenue: { thisMonth: 0, thisYear: 0 },
    expenses: { thisMonth: 0, thisYear: 0 },
    netProfit: { thisMonth: 0, thisYear: 0 },
    transactionCount: { income: 0, expense: 0 },
    invoiceSummary: { paid: 0, unpaid: 0, overdue: 0, draft: 0 },
    businessOverview: { accountantCount: 0, businessCount: 0, businessName: '', businessType: '' },
    financialTrends: [],
    recentActivity: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data function
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/auth/login');
          return;
        }

        const response = await axios.get(`http://localhost:5000/api/dashboard/${businessId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const apiData = response.data.data || {};
        setDashboardData({
          revenue: apiData.revenue || { thisMonth: 0, thisYear: 0 },
          expenses: apiData.expenses || { thisMonth: 0, thisYear: 0 },
          netProfit: apiData.netProfit || { thisMonth: 0, thisYear: 0 },
          transactionCount: apiData.transactionCount || { income: 0, expense: 0 },
          invoiceSummary: apiData.invoiceSummary || { paid: 0, unpaid: 0, overdue: 0, draft: 0 },
          businessOverview: {
            accountantCount: apiData.businessOverview?.accountantCount || 0,
            businessCount: apiData.businessOverview?.businessCount || 0,
            businessName: apiData.businessOverview?.businessName || '',
            businessType: apiData.businessOverview?.businessType || ''
          },
          financialTrends: apiData.financialTrends || [],
          recentActivity: apiData.recentActivity || []
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (businessId) {
      fetchData();
    }
  }, [businessId, navigate]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Prepare data for invoice pie chart
  const invoiceData = [
    { name: 'Paid', value: dashboardData.invoiceSummary.paid, color: '#10B981' },
    { name: 'Unpaid', value: dashboardData.invoiceSummary.unpaid, color: '#F59E0B' },
    { name: 'Overdue', value: dashboardData.invoiceSummary.overdue, color: '#EF4444' },
    { name: 'Draft', value: dashboardData.invoiceSummary.draft, color: '#6B7280' }
  ];

  // Prepare data for transaction comparison chart
  const transactionData = [
    { name: 'Income', value: dashboardData.transactionCount.income, color: '#10B981' },
    { name: 'Expense', value: dashboardData.transactionCount.expense, color: '#EF4444' }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">Error Loading Dashboard</h3>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Business Selector */}
      <div className="mb-8">
        <BusinessSelector />
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {dashboardData.businessOverview.businessName || 'Business Dashboard'}
            </h1>
            <p className="text-sm text-gray-500">
              {dashboardData.businessOverview.businessType || 'Business Overview'} • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar size={18} className="text-blue-600" />
              <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(dashboardData.revenue.thisMonth)}
          subtitle={`${formatCurrency(dashboardData.revenue.thisYear)} this year`}
          icon={<DollarSign size={24} />}
          iconColor="#10B981"
          trend="up"
          trendValue="12% from last month"
        />
        <StatCard
          title="Expenses This Month"
          value={formatCurrency(dashboardData.expenses.thisMonth)}
          subtitle={`${formatCurrency(dashboardData.expenses.thisYear)} this year`}
          icon={<CreditCard size={24} />}
          iconColor="#EF4444"
          trend="down"
          trendValue="5% from last month"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(dashboardData.netProfit.thisMonth)}
          subtitle={`${formatCurrency(dashboardData.netProfit.thisYear)} this year`}
          icon={dashboardData.netProfit.thisMonth >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
          iconColor={dashboardData.netProfit.thisMonth >= 0 ? "#10B981" : "#EF4444"}
          trend={dashboardData.netProfit.thisMonth >= 0 ? "up" : "down"}
          trendValue="8% from last month"
        />
        <StatCard
          title="Total Transactions"
          value={dashboardData.transactionCount.income + dashboardData.transactionCount.expense}
          subtitle={`${dashboardData.transactionCount.income} income, ${dashboardData.transactionCount.expense} expense`}
          icon={<Activity size={24} />}
          iconColor="#3B82F6"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Financial Trends Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <BarChart size={20} className="mr-2 text-blue-600" />
              Financial Trends
            </h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">Monthly</button>
              <button className="px-3 py-1 text-xs text-gray-500 rounded-full">Quarterly</button>
              <button className="px-3 py-1 text-xs text-gray-500 rounded-full">Yearly</button>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.financialTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <PieChart size={20} className="mr-2 text-purple-600" />
              Invoice Analytics
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="h-56 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={invoiceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {invoiceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full md:w-1/2">
              <InvoiceStatusCard 
                title="Paid" 
                value={dashboardData.invoiceSummary.paid} 
                color="#10B981"
                icon={<DollarSign size={18} />}
              />
              <InvoiceStatusCard 
                title="Unpaid" 
                value={dashboardData.invoiceSummary.unpaid} 
                color="#F59E0B"
                icon={<DollarSign size={18} />}
              />
              <InvoiceStatusCard 
                title="Overdue" 
                value={dashboardData.invoiceSummary.overdue} 
                color="#EF4444"
                icon={<DollarSign size={18} />}
              />
              <InvoiceStatusCard 
                title="Draft" 
                value={dashboardData.invoiceSummary.draft} 
                color="#6B7280"
                icon={<FileText size={18} />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Recent Activity and Business Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity size={20} className="mr-2 text-blue-600" />
            Recent Activity
          </h2>
          <div className="overflow-y-auto max-h-80">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">No recent activity to display</p>
            )}
          </div>
        </div>

        {/* Business Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Building size={20} className="mr-2 text-indigo-600" />
            Business Overview
          </h2>
          
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500">Accountants</h3>
              <div className="flex items-center mt-1">
                <Users size={18} className="text-blue-500 mr-2" />
                <span className="text-xl font-bold text-gray-800">{dashboardData.businessOverview.accountantCount}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Business Count</h3>
              <div className="flex items-center mt-1">
                <Building size={18} className="text-purple-500 mr-2" />
                <span className="text-xl font-bold text-gray-800">{dashboardData.businessOverview.businessCount}</span>
              </div>
            </div>
          </div>
          
          {/* Transaction Comparison Chart */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Transaction Breakdown</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="Count">
                    {transactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard;