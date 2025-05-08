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
  CreditCard
} from 'lucide-react';
import BusinessSelector from '../../components/dashboard/BusinessSelector';
import FinancialTrends from '../../components/dashboard/FinancialTrends';
import RecentActivity from '../../components/dashboard/RecentActivity';
import  ExpensesOverview  from '../../components/dashboard/ExpensesOverview';

// Stat card with inline styles to ensure consistent layout
const InlineStatCard = ({ title, value, subtitle, icon, iconColor }) => {
  const cardStyle = {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: '100%',
    width: '100%'
  };
  
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  };
  
  const titleStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#6B7280'
  };
  
  const valueStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    marginTop: '8px'
  };
  
  const subtitleStyle = {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '4px'
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>{title}</span>
        {icon && <span style={{ color: iconColor }}>{icon}</span>}
      </div>
      <div>
        <p style={valueStyle}>{value}</p>
        {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      </div>
    </div>
  );
};

const InlineStyledDashboard = () => {
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
          recentActivity: apiData.recentActivity || [],
          expensesOverview: apiData.expensesOverview || []
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '16rem' }}>
        <p style={{ fontSize: '1.125rem', color: '#4B5563' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            marginTop: '1rem', 
            padding: '0.5rem 1.5rem', 
            backgroundColor: '#2563EB', 
            color: 'white', 
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Business Selector and Overview */}
      <div style={{ marginBottom: '2rem' }}>
        <BusinessSelector />
        <div style={{ marginTop: '0.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
            {dashboardData.businessOverview.businessName || 'Business Dashboard'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            {dashboardData.businessOverview.businessType || 'Business Overview'}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <InlineStatCard
          title="Revenue This Month"
          value={formatCurrency(dashboardData.revenue.thisMonth)}
          subtitle={`${formatCurrency(dashboardData.revenue.thisYear)} this year`}
          icon={<DollarSign size={20} />}
          iconColor="#16A34A"
        />
        <InlineStatCard
          title="Expenses This Month"
          value={formatCurrency(dashboardData.expenses.thisMonth)}
          subtitle={`${formatCurrency(dashboardData.expenses.thisYear)} this year`}
          icon={<CreditCard size={20} />}
          iconColor="#DC2626"
        />
        <InlineStatCard
          title="Net Profit"
          value={formatCurrency(dashboardData.netProfit.thisMonth)}
          subtitle={`${formatCurrency(dashboardData.netProfit.thisYear)} this year`}
          icon={dashboardData.netProfit.thisMonth >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          iconColor={dashboardData.netProfit.thisMonth >= 0 ? "#16A34A" : "#DC2626"}
        />
        <InlineStatCard
          title="Transactions"
          value={dashboardData.transactionCount.income + dashboardData.transactionCount.expense}
          subtitle={`${dashboardData.transactionCount.income} income, ${dashboardData.transactionCount.expense} expense`}
          icon={<FileText size={20} />}
          iconColor="#3B82F6"
        />
      </div>

      {/* Invoice Summary */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '1rem', color: '#111827' }}>
          Invoice Summary
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
            
          <InlineStatCard
            title="Paid Invoices"
            value={dashboardData.invoiceSummary.paid}
            icon={<DollarSign size={20} />}
            iconColor="#16A34A"
          />
          <InlineStatCard
            title="Unpaid Invoices"
            value={dashboardData.invoiceSummary.unpaid}
            icon={<DollarSign size={20} />}
            iconColor="#F59E0B"
          />
          <InlineStatCard
            title="Overdue Invoices"
            value={dashboardData.invoiceSummary.overdue}
            icon={<DollarSign size={20} />}
            iconColor="#DC2626"
          />
          <InlineStatCard
            title="Draft Invoices"
            value={dashboardData.invoiceSummary.draft}
            icon={<FileText size={20} />}
            iconColor="#6B7280"
          />
        </div>
      </div>

      {/* Financial Trends and Recent Activity */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '1rem', color: '#111827' }}>
            Financial Trends
          </h2>
          <FinancialTrends data={dashboardData.financialTrends} />
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '1rem', color: '#111827' }}>
          expenses Overview
          </h2>
          <ExpensesOverview data={dashboardData.expenses} />
        </div>

       

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '1rem', color: '#111827' }}>
            Recent Activity
          </h2>
          <RecentActivity activities={dashboardData.recentActivity} />
        </div>
      </div>

      

      {/* Business Info */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '1rem', color: '#111827' }}>
          Business Information
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1rem'
        }}>
          <InlineStatCard
            title="Accountants"
            value={dashboardData.businessOverview.accountantCount}
            icon={<Users size={20} />}
            iconColor="#3B82F6" 
          />
          <InlineStatCard
            title="Business Count"
            value={dashboardData.businessOverview.businessCount}
            icon={<Building size={20} />}
            iconColor="#8B5CF6"
          />
        </div>
      </div>
    </div>
  );
};

export default InlineStyledDashboard;