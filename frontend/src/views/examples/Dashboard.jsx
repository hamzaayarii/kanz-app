import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BusinessSelector from '../../components/dashboard/BusinessSelector';
import TransactionSummary from '../../components/dashboard/TransactionSummary';
import RevenueOverview from '../../components/dashboard/RevenueOverview';
import ExpensesOverview from '../../components/dashboard/ExpensesOverview';
import ProfitOverview from '../../components/dashboard/ProfitOverview';
import BusinessOverview from '../../components/dashboard/BusinessOverview';
import InvoiceSummary from '../../components/dashboard/InvoiceSummary';
import FinancialTrends from '../../components/dashboard/FinancialTrends';
import RecentActivity from '../../components/dashboard/RecentActivity';

const Dashboard = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    revenue: { thisMonth: 0, thisYear: 0 },
    expenses: { thisMonth: 0, thisYear: 0 },
    netProfit: { thisMonth: 0, thisYear: 0 },
    transactionCount: { income: 0, expense: 0 },
    invoiceSummary: { paid: 0, unpaid: 0, overdue: 0, draft: 0 },
    businessOverview: { 
      accountantCount: 0, 
      businessCount: 0, 
      businessName: '', 
      businessType: '' 
    },
    financialTrends: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

        // Map the API response to match your component expectations
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {dashboardData.businessOverview.businessName || 'Dashboard'}
        </h1>
        <BusinessSelector />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <TransactionSummary data={dashboardData.transactionCount} />
        <RevenueOverview data={dashboardData.revenue} />
        <ExpensesOverview data={dashboardData.expenses} />
        <ProfitOverview data={dashboardData.netProfit} />
        <BusinessOverview data={dashboardData.businessOverview} />
        <InvoiceSummary data={dashboardData.invoiceSummary} />
        <FinancialTrends data={dashboardData.financialTrends} />
        <RecentActivity activities={dashboardData.recentActivity} />
      </div>
    </div>
  );
};

export default Dashboard;