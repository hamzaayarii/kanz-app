import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Row, Col } from 'reactstrap';

// Dashboard Components
import TransactionSummary from '../../components/dashboard/TransactionSummary';
import RevenueOverview from '../../components/dashboard/RevenueOverview';
import ExpensesOverview from '../../components/dashboard/ExpensesOverview';
import ProfitOverview from '../../components/dashboard/ProfitOverview';
import BusinessOverview from '../../components/dashboard/BusinessOverview';
import InvoiceSummary from '../../components/dashboard/InvoiceSummary';
import FinancialTrends from '../../components/dashboard/FinancialTrends';
import RecentActivity from '../../components/dashboard/RecentActivity';

// TTS Components
import HoverSpeakText from '../../components/TTS/HoverSpeakText';
import TTSButton from '../../components/TTS/TTSButton';
import { useTTS } from '../../components/TTS/TTSContext';

const Dashboard = ({ businessId }) => {
  const navigate = useNavigate();
  const { isTTSEnabled, speak, stop } = useTTS();

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
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    const fetchData = async () => {
      if (!businessId) {
        setError('No business selected');
        setLoading(false);
        return;
      }

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
          },
          params: {
            period: selectedPeriod
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

        // Speak dashboard summary when data loads and TTS is enabled
        if (isTTSEnabled) {
          const summary = `Dashboard loaded for ${apiData.businessOverview?.businessName || 'your business'}. 
            Current ${selectedPeriod} revenue: ${selectedPeriod === 'month' ? apiData.revenue.thisMonth : apiData.revenue.thisYear}. 
            Expenses: ${selectedPeriod === 'month' ? apiData.expenses.thisMonth : apiData.expenses.thisYear}. 
            Net profit: ${selectedPeriod === 'month' ? apiData.netProfit.thisMonth : apiData.netProfit.thisYear}.`;
          speak(summary);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId, navigate, selectedPeriod, isTTSEnabled, speak]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (isTTSEnabled) {
      speak(`Switched to ${period} view`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary mt-3"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container" id="dashboard-container">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="mb-0">
            <HoverSpeakText>
              {dashboardData.businessOverview.businessName ? dashboardData.businessOverview.businessName : 'Total'}
            </HoverSpeakText>
            {isTTSEnabled && (
              <TTSButton 
                elementId="dashboard-container"
                className="ml-2"
                size="sm"
                label="Read all dashboard information"
              />
            )}
          </h2>
          <p className="text-muted small">
            <HoverSpeakText>Overview of your financial performance</HoverSpeakText>
          </p>
        </div>
        <div className="d-flex align-items-center">
          <div className="dropdown">
            <HoverSpeakText textToSpeak={`Current view: ${selectedPeriod === 'month' ? 'Month' : 'Year'}`}>
              <button 
                className="btn btn-outline-secondary dropdown-toggle" 
                type="button" 
                id="periodDropdown" 
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {selectedPeriod === 'month' ? 'Month' : 'Year'}
              </button>
            </HoverSpeakText>
            <ul className="dropdown-menu" aria-labelledby="periodDropdown">
              <li>
                <HoverSpeakText textToSpeak="Switch to month view">
                  <button 
                    className={`dropdown-item ${selectedPeriod === 'month' ? 'active' : ''}`}
                    onClick={() => handlePeriodChange('month')}
                  >
                    Month
                  </button>
                </HoverSpeakText>
              </li>
              <li>
                <HoverSpeakText textToSpeak="Switch to year view">
                  <button 
                    className={`dropdown-item ${selectedPeriod === 'year' ? 'active' : ''}`}
                    onClick={() => handlePeriodChange('year')}
                  >
                    Year
                  </button>
                </HoverSpeakText>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* First row of stats */}
      <Row className="mb-4 g-3">
        <Col lg="3" md="6">
          <div id="transaction-summary">
            <HoverSpeakText textToSpeak="Transaction summary">
              <TransactionSummary data={dashboardData.transactionCount} />
            </HoverSpeakText>
            {isTTSEnabled && (
              <TTSButton 
                text={`Transaction summary: ${dashboardData.transactionCount.income} income transactions, ${dashboardData.transactionCount.expense} expense transactions`}
                className="mt-2"
                size="sm"
              />
            )}
          </div>
        </Col>
        <Col lg="3" md="6">
          <div id="revenue-overview">
            <HoverSpeakText textToSpeak="Revenue overview">
              <RevenueOverview data={dashboardData.revenue} period={selectedPeriod} />
            </HoverSpeakText>
            {isTTSEnabled && (
              <TTSButton 
                text={`Revenue this ${selectedPeriod}: ${selectedPeriod === 'month' ? dashboardData.revenue.thisMonth : dashboardData.revenue.thisYear}`}
                className="mt-2"
                size="sm"
              />
            )}
          </div>
        </Col>
        <Col lg="3" md="6">
          <div id="expenses-overview">
            <HoverSpeakText textToSpeak="Expenses overview">
              <ExpensesOverview data={dashboardData.expenses} period={selectedPeriod} />
            </HoverSpeakText>
            {isTTSEnabled && (
              <TTSButton 
                text={`Expenses this ${selectedPeriod}: ${selectedPeriod === 'month' ? dashboardData.expenses.thisMonth : dashboardData.expenses.thisYear}`}
                className="mt-2"
                size="sm"
              />
            )}
          </div>
        </Col>
        <Col lg="3" md="6">
          <div id="profit-overview">
            <HoverSpeakText textToSpeak="Profit overview">
              <ProfitOverview data={dashboardData.netProfit} period={selectedPeriod} />
            </HoverSpeakText>
            {isTTSEnabled && (
              <TTSButton 
                text={`Net profit this ${selectedPeriod}: ${selectedPeriod === 'month' ? dashboardData.netProfit.thisMonth : dashboardData.netProfit.thisYear}`}
                className="mt-2"
                size="sm"
              />
            )}
          </div>
        </Col>
      </Row>

      {/* Second row of stats */}
      <Row className="g-3">
        <Col lg="3" md="6">
          <div id="business-overview">
            <HoverSpeakText textToSpeak="Business overview">
              <BusinessOverview data={dashboardData.businessOverview} />
            </HoverSpeakText>
            {isTTSEnabled && (
              <TTSButton 
                text={`Business: ${dashboardData.businessOverview.businessName}. Type: ${dashboardData.businessOverview.businessType}. Accountants: ${dashboardData.businessOverview.accountantCount}`}
                className="mt-2"
                size="sm"
              />
            )}
          </div>
        </Col>
        <Col lg="3" md="6">
          <div id="invoice-summary">
            <HoverSpeakText textToSpeak="Invoice summary">
              <InvoiceSummary data={dashboardData.invoiceSummary} />
            </HoverSpeakText>
            {isTTSEnabled && (
              <TTSButton 
                text={`Invoices: ${dashboardData.invoiceSummary.paid} paid, ${dashboardData.invoiceSummary.unpaid} unpaid, ${dashboardData.invoiceSummary.overdue} overdue, ${dashboardData.invoiceSummary.draft} draft`}
                className="mt-2"
                size="sm"
              />
            )}
          </div>
        </Col>
        <Col lg="3" md="6">
          <div id="financial-trends">
            <HoverSpeakText textToSpeak="Financial trends">
              <FinancialTrends data={dashboardData.financialTrends} />
            </HoverSpeakText>
            {isTTSEnabled && (
              <TTSButton 
                text="Financial trends chart showing performance over time"
                className="mt-2"
                size="sm"
              />
            )}
          </div>
        </Col>
        <Col lg="3" md="6">
          <div id="recent-activity">
            <HoverSpeakText textToSpeak="Recent activity">
              <RecentActivity activities={dashboardData.recentActivity} />
            </HoverSpeakText>
            {isTTSEnabled && (
              <TTSButton 
                text={`Recent activities: ${dashboardData.recentActivity.length} items`}
                className="mt-2"
                size="sm"
              />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;