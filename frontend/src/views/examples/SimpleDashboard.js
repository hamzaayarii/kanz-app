// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { 
//   DollarSign, 
//   TrendingDown, 
//   TrendingUp, 
//   Users, 
//   Building, 
//   FileText, 
//   CreditCard
// } from 'lucide-react';
// import BusinessSelector from '../../components/dashboard/BusinessSelector';
// import FinancialTrends from '../../components/dashboard/FinancialTrends';
// import RecentActivity from '../../components/dashboard/RecentActivity';

// // Simple stat card component that reliably renders horizontally
// const StatCard = ({ title, value, subtitle, icon, bgColor = 'bg-blue-50', iconColor = 'text-blue-500' }) => {
//   return (
//     <div className="bg-white p-4 rounded-lg shadow-sm h-full">
//       <div className="flex justify-between items-start mb-2">
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         {icon && <span className={iconColor}>{icon}</span>}
//       </div>
//       <div className="mt-2">
//         <p className="text-2xl font-bold text-gray-900">{value}</p>
//         {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
//       </div>
//     </div>
//   );
// };

// const SimpleDashboard = () => {
//   const { businessId } = useParams();
//   const navigate = useNavigate();

//   const [dashboardData, setDashboardData] = useState({
//     revenue: { thisMonth: 0, thisYear: 0 },
//     expenses: { thisMonth: 0, thisYear: 0 },
//     netProfit: { thisMonth: 0, thisYear: 0 },
//     transactionCount: { income: 0, expense: 0 },
//     invoiceSummary: { paid: 0, unpaid: 0, overdue: 0, draft: 0 },
//     businessOverview: { accountantCount: 0, businessCount: 0, businessName: '', businessType: '' },
//     financialTrends: [],
//     recentActivity: []
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch data function
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('authToken');
//         if (!token) {
//           navigate('/auth/login');
//           return;
//         }

//         const response = await axios.get(`http://localhost:5000/api/dashboard/${businessId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });

//         const apiData = response.data.data || {};
//         setDashboardData({
//           revenue: apiData.revenue || { thisMonth: 0, thisYear: 0 },
//           expenses: apiData.expenses || { thisMonth: 0, thisYear: 0 },
//           netProfit: apiData.netProfit || { thisMonth: 0, thisYear: 0 },
//           transactionCount: apiData.transactionCount || { income: 0, expense: 0 },
//           invoiceSummary: apiData.invoiceSummary || { paid: 0, unpaid: 0, overdue: 0, draft: 0 },
//           businessOverview: {
//             accountantCount: apiData.businessOverview?.accountantCount || 0,
//             businessCount: apiData.businessOverview?.businessCount || 0,
//             businessName: apiData.businessOverview?.businessName || '',
//             businessType: apiData.businessOverview?.businessType || ''
//           },
//           financialTrends: apiData.financialTrends || [],
//           recentActivity: apiData.recentActivity || []
//         });
//       } catch (err) {
//         setError(err.response?.data?.message || 'Failed to load dashboard');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (businessId) {
//       fetchData();
//     }
//   }, [businessId, navigate]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <p className="text-lg text-gray-600">Loading dashboard...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow">
//         <p>{error}</p>
//         <button 
//           onClick={() => window.location.reload()}
//           className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="px-6 py-8 bg-gray-50 min-h-screen">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             {dashboardData.businessOverview.businessName || 'Dashboard'}
//           </h1>
//           <p className="text-gray-500 text-sm mt-1">Overview of your financial performance</p>
//         </div>
//         <BusinessSelector />
//       </div>

//       {/* First row of stat cards */}
//       <div className="mb-6" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
//         <div style={{ flex: '1', minWidth: '220px' }}>
//           <StatCard 
//             title="Revenue"
//             value={dashboardData.revenue.thisMonth}
//             subtitle="This month"
//             icon={<DollarSign size={20} />}
//             iconColor="text-green-500"
//           />
//         </div>
//         <div style={{ flex: '1', minWidth: '220px' }}>
//           <StatCard 
//             title="Expenses"
//             value={dashboardData.expenses.thisMonth}
//             subtitle="This month"
//             icon={<TrendingDown size={20} />}
//             iconColor="text-red-500"
//           />
//         </div>
//         <div style={{ flex: '1', minWidth: '220px' }}>
//           <StatCard 
//             title="Net Profit"
//             value={dashboardData.netProfit.thisMonth}
//             subtitle="This month"
//             icon={<TrendingUp size={20} />}
//             iconColor="text-blue-500"
//           />
//         </div>
//         <div style={{ flex: '1', minWidth: '220px' }}>
//           <StatCard 
//             title="Invoices"
//             value={dashboardData.invoiceSummary.unpaid + dashboardData.invoiceSummary.overdue}
//             subtitle="Outstanding"
//             icon={<FileText size={20} />}
//             iconColor="text-amber-500"
//           />
//         </div>
//       </div>

//       {/* Second row of stat cards */}
//       <div className="mb-6" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
//         <div style={{ flex: '1', minWidth: '220px' }}>
//           <StatCard 
//             title="Income Transactions"
//             value={dashboardData.transactionCount.income}
//             icon={<CreditCard size={20} />}
//             iconColor="text-green-500"
//           />
//         </div>
//         <div style={{ flex: '1', minWidth: '220px' }}>
//           <StatCard 
//             title="Expense Transactions"
//             value={dashboardData.transactionCount.expense}
//             icon={<CreditCard size={20} />}
//             iconColor="text-red-500"
//           />
//         </div>
//         <div style={{ flex: '1', minWidth: '220px' }}>
//           <StatCard 
//             title="Accountants"
//             value={dashboardData.businessOverview.accountantCount}
//             icon={<Users size={20} />}
//             iconColor="text-indigo-500"
//           />
//         </div>
//         <div style={{ flex: '1', minWidth: '220px' }}>
//           <StatCard 
//             title="Businesses"
//             value={dashboardData.businessOverview.businessCount}
//             icon={<Building size={20} />}
//             iconColor="text-purple-500"
//           />
//         </div>
//       </div>

//       {/* Financial Trends and Recent Activity */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-4 rounded-lg shadow-sm">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Trends</h3>
//           <FinancialTrends data={dashboardData.financialTrends} />
//         </div>
        
//         <div className="bg-white p-4 rounded-lg shadow-sm">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
//           <RecentActivity activities={dashboardData.recentActivity} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SimpleDashboard;