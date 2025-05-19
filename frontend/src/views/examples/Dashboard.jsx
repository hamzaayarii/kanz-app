import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Row, 
  Col, 
  Card, 
  CardBody, 
  CardHeader, 
  Progress, 
  Badge,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem 
} from 'reactstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import { 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  Users, 
  Activity,
  AlertCircle,
  BarChart2,
  PieChart
} from 'react-feather';

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
    revenue: { thisMonth: 0, thisYear: 0, previousMonth: 0, previousYear: 0, trend: [] },
    expenses: { thisMonth: 0, thisYear: 0, previousMonth: 0, previousYear: 0, trend: [] },
    netProfit: { thisMonth: 0, thisYear: 0, previousMonth: 0, previousYear: 0, trend: [] },
    transactionCount: { income: 0, expense: 0, lastWeek: { income: 0, expense: 0 } },
    invoiceSummary: { paid: 0, unpaid: 0, overdue: 0, draft: 0, trend: [] },
    businessOverview: { 
      accountantCount: 0, 
      businessCount: 0, 
      businessName: '', 
      businessType: '',
      foundedDate: '',
      totalCustomers: 0,
      totalVendors: 0 
    },
    financialTrends: [],
    recentActivity: [],
    cashFlow: {
      labels: [],
      inflows: [],
      outflows: [],
      netFlow: []
    },
    expenseCategories: [],
    revenueStreams: [],
    taxLiability: { current: 0, ytd: 0, projectedEndOfYear: 0 },
    budgetPerformance: { categories: [], actual: [], planned: [], variance: [] }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [comparisonMode, setComparisonMode] = useState(false);

  const toggleDropdown = () => setDropdownOpen(prevState => !prevState);

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

        // This is where we would normally parse the API response
        // For now we'll use placeholder data to demonstrate UI capabilities
        
        const apiData = response.data.data || {};
        
        // Enhance with additional mock data for new features
        const enhancedData = {
          ...apiData,
          revenue: {
            ...(apiData.revenue || { thisMonth: 0, thisYear: 0 }),
            previousMonth: 45000,
            previousYear: 520000,
            trend: [42000, 45000, 48000, 46000, 52000, 58000]
          },
          expenses: {
            ...(apiData.expenses || { thisMonth: 0, thisYear: 0 }),
            previousMonth: 38000,
            previousYear: 450000,
            trend: [36000, 38000, 37000, 42000, 44000, 43000]
          },
          netProfit: {
            ...(apiData.netProfit || { thisMonth: 0, thisYear: 0 }),
            previousMonth: 7000,
            previousYear: 70000,
            trend: [6000, 7000, 11000, 4000, 8000, 15000]
          },
          cashFlow: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            inflows: [58000, 62000, 65000, 61000, 68000, 74000],
            outflows: [43000, 40000, 47000, 53000, 48000, 52000],
            netFlow: [15000, 22000, 18000, 8000, 20000, 22000]
          },
          expenseCategories: [
            { category: 'Payroll', amount: 25000, percentage: 45 },
            { category: 'Operations', amount: 12000, percentage: 21 },
            { category: 'Marketing', amount: 8000, percentage: 14 },
            { category: 'Office', amount: 5000, percentage: 9 },
            { category: 'Other', amount: 6000, percentage: 11 }
          ],
          revenueStreams: [
            { stream: 'Product A', amount: 32000, percentage: 52 },
            { stream: 'Product B', amount: 18000, percentage: 29 },
            { stream: 'Services', amount: 8000, percentage: 13 },
            { stream: 'Other', amount: 4000, percentage: 6 }
          ],
          taxLiability: { current: 12500, ytd: 48000, projectedEndOfYear: 95000 },
          budgetPerformance: {
            categories: ['Payroll', 'Marketing', 'Operations', 'IT', 'Office'],
            actual: [25000, 8000, 12000, 6000, 5000],
            planned: [23000, 10000, 11000, 7000, 4000],
            variance: [8.7, -20, 9.1, -14.3, 25]
          }
        };
        
        setDashboardData(enhancedData);

        // Speak dashboard summary when data loads and TTS is enabled
        if (isTTSEnabled) {
          const summary = `Dashboard loaded for ${enhancedData.businessOverview?.businessName || 'your business'}. 
            Current ${selectedPeriod} revenue: ${selectedPeriod === 'month' ? enhancedData.revenue.thisMonth : enhancedData.revenue.thisYear}. 
            Expenses: ${selectedPeriod === 'month' ? enhancedData.expenses.thisMonth : enhancedData.expenses.thisYear}. 
            Net profit: ${selectedPeriod === 'month' ? enhancedData.netProfit.thisMonth : enhancedData.netProfit.thisYear}.`;
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

  // Calculate percentage change for KPIs
  const calculateChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Format numbers as currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const toggleTab = (tab) => {
    setActiveTab(tab);
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
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

  // Prepare chart data for revenue, expenses, and profit trends
  const financialTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: dashboardData.revenue.trend,
        borderColor: '#5e72e4',
        backgroundColor: 'rgba(94, 114, 228, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: dashboardData.expenses.trend,
        borderColor: '#fb6340',
        backgroundColor: 'rgba(251, 99, 64, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Net Profit',
        data: dashboardData.netProfit.trend,
        borderColor: '#2dce89',
        backgroundColor: 'rgba(45, 206, 137, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Cash flow chart data
  const cashFlowData = {
    labels: dashboardData.cashFlow.labels,
    datasets: [
      {
        type: 'bar',
        label: 'Inflows',
        data: dashboardData.cashFlow.inflows,
        backgroundColor: 'rgba(45, 206, 137, 0.6)',
        borderColor: '#2dce89',
        borderWidth: 1
      },
      {
        type: 'bar',
        label: 'Outflows',
        data: dashboardData.cashFlow.outflows.map(value => -value), // Negative to show below axis
        backgroundColor: 'rgba(251, 99, 64, 0.6)',
        borderColor: '#fb6340',
        borderWidth: 1
      },
      {
        type: 'line',
        label: 'Net Flow',
        data: dashboardData.cashFlow.netFlow,
        borderColor: '#5e72e4',
        borderWidth: 2,
        pointBackgroundColor: '#5e72e4',
        fill: false,
        tension: 0.4
      }
    ]
  };

  // Expense distribution (doughnut chart)
  const expenseDistributionData = {
    labels: dashboardData.expenseCategories.map(item => item.category),
    datasets: [{
      data: dashboardData.expenseCategories.map(item => item.amount),
      backgroundColor: [
        '#5e72e4', '#2dce89', '#fb6340', '#11cdef', '#172b4d'
      ],
      borderWidth: 0
    }]
  };

  // Revenue streams (doughnut chart)
  const revenueStreamsData = {
    labels: dashboardData.revenueStreams.map(item => item.stream),
    datasets: [{
      data: dashboardData.revenueStreams.map(item => item.amount),
      backgroundColor: [
        '#5e72e4', '#2dce89', '#fb6340', '#11cdef'
      ],
      borderWidth: 0
    }]
  };

  // Budget performance (bar chart)
  const budgetPerformanceData = {
    labels: dashboardData.budgetPerformance.categories,
    datasets: [
      {
        label: 'Planned',
        data: dashboardData.budgetPerformance.planned,
        backgroundColor: 'rgba(94, 114, 228, 0.6)',
        borderWidth: 0
      },
      {
        label: 'Actual',
        data: dashboardData.budgetPerformance.actual,
        backgroundColor: 'rgba(45, 206, 137, 0.6)',
        borderWidth: 0
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          usePointStyle: true
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += formatCurrency(context.raw);
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 10,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = formatCurrency(context.raw);
            const percentage = dashboardData.expenseCategories[context.dataIndex]?.percentage || 
                              dashboardData.revenueStreams[context.dataIndex]?.percentage;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  const renderKPICard = (title, value, previousValue, icon, color, description) => {
    const percentChange = calculateChange(value, previousValue);
    const isPositive = percentChange >= 0;
    
    return (
      <Card className="shadow-sm border-0 h-100">
        <CardBody>
          <div className="d-flex justify-content-between">
            <div>
              <p className="text-muted text-sm mb-1">{title}</p>
              <h3 className="mb-0 font-weight-bold">{formatCurrency(value)}</h3>
            </div>
            <div className={`icon-shape bg-${color} text-white rounded-circle shadow-sm p-2`}>
              {icon}
            </div>
          </div>
          
          <div className="d-flex align-items-center mt-3">
            <span className={`text-${isPositive ? 'success' : 'danger'} mr-2 d-flex align-items-center`}>
              {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
              {Math.abs(percentChange).toFixed(1)}%
            </span>
            <span className="text-muted text-sm">vs {selectedPeriod === 'month' ? 'last month' : 'last year'}</span>
          </div>
          
          {description && (
            <p className="text-muted text-sm mt-2">{description}</p>
          )}
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="dashboard-container animate__animated animate__fadeIn" id="dashboard-container">
      <Card className="shadow-lg border-0 mb-4 bg-gradient-teal text-white">
        <CardBody>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1 text-white">
                <HoverSpeakText>
                  {dashboardData.businessOverview.businessName ? dashboardData.businessOverview.businessName : 'Business Dashboard'}
                </HoverSpeakText>
              </h2>
              <p className="mb-0">
                <Calendar size={14} className="mr-1" /> 
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            <div className="d-flex">
              {isTTSEnabled && (
                <TTSButton 
                  elementId="dashboard-container"
                  className="ml-2 btn-icon-only rounded-circle"
                  size="sm"
                  color="white"
                  label="Read all dashboard information"
                />
              )}
              
              <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="ml-2">
                <DropdownToggle caret color="white" size="sm">
                  {selectedPeriod === 'month' ? 'Monthly View' : 'Yearly View'}
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem onClick={() => handlePeriodChange('month')}>
                    Monthly View
                  </DropdownItem>
                  <DropdownItem onClick={() => handlePeriodChange('year')}>
                    Yearly View
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem onClick={toggleComparisonMode}>
                    {comparisonMode ? 'Disable Comparison' : 'Enable Comparison'}
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mb-4">
        <ul className="nav nav-tabs nav-fill">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => toggleTab('overview')}
            >
              <BarChart2 size={16} className="mr-2" />
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'cashflow' ? 'active' : ''}`}
              onClick={() => toggleTab('cashflow')}
            >
              <TrendingUp size={16} className="mr-2" />
              Cash Flow
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'expenses' ? 'active' : ''}`}
              onClick={() => toggleTab('expenses')}
            >
              <PieChart size={16} className="mr-2" />
              Expenses
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'budget' ? 'active' : ''}`}
              onClick={() => toggleTab('budget')}
            >
              <Activity size={16} className="mr-2" />
              Budget
            </button>
          </li>
        </ul>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <Row className="mb-4 g-3">
            <Col lg="3" md="6">
              {renderKPICard(
                'Revenue', 
                selectedPeriod === 'month' ? dashboardData.revenue.thisMonth : dashboardData.revenue.thisYear,
                selectedPeriod === 'month' ? dashboardData.revenue.previousMonth : dashboardData.revenue.previousYear,
                <DollarSign size={20} />,
                'primary',
                'Total earnings for this period'
              )}
            </Col>
            <Col lg="3" md="6">
              {renderKPICard(
                'Expenses', 
                selectedPeriod === 'month' ? dashboardData.expenses.thisMonth : dashboardData.expenses.thisYear,
                selectedPeriod === 'month' ? dashboardData.expenses.previousMonth : dashboardData.expenses.previousYear,
                <FileText size={20} />,
                'warning',
                'Total costs for this period'
              )}
            </Col>
            <Col lg="3" md="6">
              {renderKPICard(
                'Net Profit', 
                selectedPeriod === 'month' ? dashboardData.netProfit.thisMonth : dashboardData.netProfit.thisYear,
                selectedPeriod === 'month' ? dashboardData.netProfit.previousMonth : dashboardData.netProfit.previousYear,
                <TrendingUp size={20} />,
                'success',
                'Earnings minus expenses'
              )}
            </Col>
            <Col lg="3" md="6">
              {renderKPICard(
                'Tax Liability', 
                dashboardData.taxLiability.current,
                0,
                <AlertCircle size={20} />,
                'danger',
                `YTD: ${formatCurrency(dashboardData.taxLiability.ytd)}`
              )}
            </Col>
          </Row>

          {/* Financial Trends Chart */}
          <Row className="mb-4">
            <Col lg="8">
              <Card className="shadow-sm border-0 h-100">
                <CardHeader className="bg-transparent border-0">
                  <h5 className="mb-0">Financial Trends</h5>
                </CardHeader>
                <CardBody>
                  <div style={{ height: "300px" }}>
                    <Line 
                      data={financialTrendsData} 
                      options={lineChartOptions} 
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col lg="4">
              <Card className="shadow-sm border-0 h-100">
                <CardHeader className="bg-transparent border-0">
                  <h5 className="mb-0">Business Stats</h5>
                </CardHeader>
                <CardBody>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Business Type</span>
                      <span className="font-weight-bold">{dashboardData.businessOverview.businessType || 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Founded</span>
                      <span className="font-weight-bold">{dashboardData.businessOverview.foundedDate || 'N/A'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Accountants</span>
                      <span className="font-weight-bold">{dashboardData.businessOverview.accountantCount}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Customers</span>
                      <span className="font-weight-bold">{dashboardData.businessOverview.totalCustomers || 45}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Vendors</span>
                      <span className="font-weight-bold">{dashboardData.businessOverview.totalVendors || 12}</span>
                    </div>
                  </div>
                  
                  <h6 className="mb-2">Invoice Status</h6>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-sm">Paid</span>
                      <span className="text-sm font-weight-bold">{dashboardData.invoiceSummary.paid}</span>
                    </div>
                    <Progress value={dashboardData.invoiceSummary.paid} 
                              max={dashboardData.invoiceSummary.paid + dashboardData.invoiceSummary.unpaid + dashboardData.invoiceSummary.overdue} 
                              color="success" className="mb-2" />
                    
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-sm">Unpaid</span>
                      <span className="text-sm font-weight-bold">{dashboardData.invoiceSummary.unpaid}</span>
                    </div>
                    <Progress value={dashboardData.invoiceSummary.unpaid} 
                              max={dashboardData.invoiceSummary.paid + dashboardData.invoiceSummary.unpaid + dashboardData.invoiceSummary.overdue} 
                              color="primary" className="mb-2" />
                    
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-sm">Overdue</span>
                      <span className="text-sm font-weight-bold">{dashboardData.invoiceSummary.overdue}</span>
                    </div>
                    <Progress value={dashboardData.invoiceSummary.overdue} 
                              max={dashboardData.invoiceSummary.paid + dashboardData.invoiceSummary.unpaid + dashboardData.invoiceSummary.overdue} 
                              color="danger" />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Transaction and Activity */}
          <Row>
            <Col lg="5">
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-transparent border-0">
                  <h5 className="mb-0">Transaction Summary</h5>
                </CardHeader>
                <CardBody>
                  <div className="d-flex justify-content-between mb-4">
                    <div className="text-center">
                      <h3 className="mb-1 font-weight-bold">{dashboardData.transactionCount.income}</h3>
                      <p className="text-muted mb-0">Income</p>
                      <Badge color="success" pill className="mt-2">
                        +{dashboardData.transactionCount.lastWeek?.income || 12} this week
                      </Badge>
                    </div>
                    <div className="text-center">
                      <h3 className="mb-1 font-weight-bold">{dashboardData.transactionCount.expense}</h3>
                      <p className="text-muted mb-0">Expenses</p>
                      <Badge color="warning" pill className="mt-2">
                        +{dashboardData.transactionCount.lastWeek?.expense || 8} this week
                      </Badge>
                    </div>
                    <div className="text-center">
                      <h3 className="mb-1 font-weight-bold">
                        {dashboardData.transactionCount.income + dashboardData.transactionCount.expense}
                      </h3>
                      <p className="text-muted mb-0">Total</p>
                      <Badge color="primary" pill className="mt-2">
                        +{(dashboardData.transactionCount.lastWeek?.income || 12) + 
                           (dashboardData.transactionCount.lastWeek?.expense || 8)} this week
                      </Badge>
                    </div>
                  </div>
                  
                  <TransactionSummary data={dashboardData.transactionCount} />
                </CardBody>
              </Card>
            </Col>
            <Col lg="7">
              <Card className="shadow-sm border-0">
                <CardHeader className="bg-transparent border-0 d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Recent Activity</h5>
                  <Button color="primary" size="sm" outline>
                    View All
                  </Button>
                </CardHeader>
                <CardBody>
                  <RecentActivity activities={dashboardData.recentActivity} />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Cash Flow Tab */}
      {activeTab === 'cashflow' && (
        <Row>
          <Col lg="8">
            <Card className="shadow-sm border-0 mb-4">
              <CardHeader className="bg-transparent border-0">
                <h5 className="mb-0">Cash Flow Analysis</h5>
              </CardHeader>
              <CardBody>
                <div style={{ height: "400px" }}>
                  <Bar 
                    data={cashFlowData} 
                    options={{
                      ...lineChartOptions,
                      scales: {
                        ...lineChartOptions.scales,
                        x: {
                          stacked: true,
                        },
                        y: {
                          ...lineChartOptions.scales.y,
                          stacked: false
                        }
                      }
                    }} 
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="4">
            <Card className="shadow-sm border-0 mb-4">
              <CardHeader className="bg-transparent border-0">
                <h5 className="mb-0">Cash Flow Summary</h5>
              </CardHeader>
              <CardBody>
                <div className="mb-4">
                  <h6 className="text-uppercase text-muted ls-1 mb-3">Current Position</h6>
                  
                  <div className="d-flex justify-content-between mb-2">
                    <span>Opening Balance</span>
                    <span className="font-weight-bold">{formatCurrency(48000)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Inflows</span>
                    <span className="font-weight-bold text-success">{formatCurrency(74000)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Outflows</span>
                    <span className="font-weight-bold text-danger">{formatCurrency(52000)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-2">
                    <span>Closing Balance</span>
                    <span className="font-weight-bold">{formatCurrency(70000)}</span>
                  </div>
                </div>
                
                <div>
                  <h6 className="text-uppercase text-muted ls-1 mb-3">Projected Cash Position</h6>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>End of Month</span>
                      <span className="font-weight-bold">{formatCurrency(84000)}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>End of Quarter</span>
                      <span className="font-weight-bold">{formatCurrency(96000)}</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>End of Year</span>
                      <span className="font-weight-bold">{formatCurrency(120000)}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <Row>
          <Col lg="6">
            <Card className="shadow-sm border-0 mb-4">
              <CardHeader className="bg-transparent border-0">
                <h5 className="mb-0">Expense Distribution</h5>
              </CardHeader>
              <CardBody>
                <div style={{ height: "350px" }}>
                  <Doughnut 
                    data={expenseDistributionData} 
                    options={doughnutChartOptions} 
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="6">
            <Card className="shadow-sm border-0 mb-4">
              <CardHeader className="bg-transparent border-0">
                <h5 className="mb-0">Revenue Streams</h5>
              </CardHeader>
              <CardBody>
                <div style={{ height: "350px" }}>
                  <Doughnut 
                    data={revenueStreamsData} 
                    options={doughnutChartOptions} 
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="12">
            <Card className="shadow-sm border-0">
              <CardHeader className="bg-transparent border-0">
                <h5 className="mb-0">Top Expense Categories</h5>
              </CardHeader>
              <CardBody>
                <div className="table-responsive">
                  <table className="table align-items-center">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>This Month</th>
                        <th>Last Month</th>
                        <th>Change</th>
                        <th>Budget</th>
                        <th>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.expenseCategories.map((category, index) => {
                        const lastMonth = Math.floor(category.amount * (0.9 + Math.random() * 0.2));
                        const change = ((category.amount - lastMonth) / lastMonth) * 100;
                        const budget = Math.floor(category.amount * (0.95 + Math.random() * 0.2));
                        const budgetVariance = ((category.amount - budget) / budget) * 100;
                        
                        return (
                          <tr key={index}>
                            <td>{category.category}</td>
                            <td>{formatCurrency(category.amount)}</td>
                            <td>{formatCurrency(lastMonth)}</td>
                            <td>
                              <span className={`text-${change >= 0 ? 'danger' : 'success'}`}>
                                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {formatCurrency(budget)}
                                <span className={`ml-2 badge bg-${budgetVariance <= 0 ? 'success' : 'danger'}`}>
                                  {budgetVariance <= 0 ? 'Under' : 'Over'}
                                </span>
                              </div>
                            </td>
                            <td>{category.percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <Row>
          <Col lg="8">
            <Card className="shadow-sm border-0 mb-4">
              <CardHeader className="bg-transparent border-0">
                <h5 className="mb-0">Budget vs. Actual</h5>
              </CardHeader>
              <CardBody>
                <div style={{ height: "400px" }}>
                  <Bar 
                    data={budgetPerformanceData} 
                    options={{
                      ...lineChartOptions,
                      scales: {
                        ...lineChartOptions.scales,
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }} 
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="4">
            <Card className="shadow-sm border-0 mb-4">
              <CardHeader className="bg-transparent border-0">
                <h5 className="mb-0">Budget Performance</h5>
              </CardHeader>
              <CardBody>
                <div className="mb-4">
                  <h6 className="text-uppercase text-muted ls-1 mb-3">Performance by Category</h6>
                  
                  {dashboardData.budgetPerformance.categories.map((category, index) => {
                    const variance = dashboardData.budgetPerformance.variance[index];
                    const varColor = variance <= 0 ? 'success' : 'danger';
                    
                    return (
                      <div key={index} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span>{category}</span>
                          <span className={`text-${varColor}`}>
                            {variance <= 0 ? variance * -1 : variance}% {variance <= 0 ? 'under' : 'over'}
                          </span>
                        </div>
                        <Progress 
                          value={dashboardData.budgetPerformance.actual[index]} 
                          max={dashboardData.budgetPerformance.planned[index] * 1.5} 
                          color={varColor} 
                        />
                      </div>
                    );
                  })}
                </div>
                
                <div>
                  <h6 className="text-uppercase text-muted ls-1 mb-3">Overall Budget Status</h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h4 className="mb-0">{formatCurrency(56000)}</h4>
                      <p className="text-muted text-sm mb-0">Total Spent</p>
                    </div>
                    <div className="text-right">
                      <h4 className="mb-0">{formatCurrency(55000)}</h4>
                      <p className="text-muted text-sm mb-0">Budget Allocated</p>
                    </div>
                  </div>
                  <Progress 
                    value={56000} 
                    max={55000} 
                    color="warning" 
                    className="mb-3" 
                  />
                  <p className="text-sm text-muted">
                    You are currently <span className="text-danger font-weight-bold">1.8% over budget</span> for this period. 
                    Consider adjusting spending in <span className="font-weight-bold">Marketing</span> and <span className="font-weight-bold">IT</span> categories.
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      <style>
        {`
          /* Color Palette Reference Guide for the Application */
          
          /* Main Colors */
          :root {
            --color-primary: #1BA39C;
            --color-primary-dark: #148B88;
            --color-primary-light: rgba(27, 163, 156, 0.1);
            --color-info: #00BCD4;
            --color-success: #4CAF50;
            --color-warning: #F57C00;
            --color-danger: #dc3545;
            --color-light: #FAFAFA;
            --color-white: #FFFFFF;
            --color-dark: #343a40;
            --color-muted: #6c757d;
          }
          
          /* Gradients */
          .bg-gradient-teal {
            background: linear-gradient(87deg, #0E6D6B 0, #1BA39C 100%) !important;
          }
          
          /* Override button styles */
          .btn-primary {
            background-color: #1BA39C !important;
            border-color: #1BA39C !important;
          }
          
          .btn-primary:hover, .btn-primary:focus, .btn-primary:active {
            background-color: #148B88 !important;
            border-color: #148B88 !important;
          }
          
          .btn-outline-primary {
            color: #1BA39C !important;
            border-color: #1BA39C !important;
          }
          
          .btn-outline-primary:hover, .btn-outline-primary:focus, .btn-outline-primary:active {
            background-color: #1BA39C !important;
            border-color: #1BA39C !important;
            color: white !important;
          }
          
          /* Icon backgrounds */
          .bg-primary {
            background-color: #1BA39C !important;
          }
          
          .bg-info {
            background-color: #00BCD4 !important;
          }
          
          .bg-success {
            background-color: #4CAF50 !important;
          }
          
          .bg-warning {
            background-color: #F57C00 !important;
          }
          
          /* Soft background variations */
          .bg-primary-soft { 
            background-color: rgba(27, 163, 156, 0.1) !important; 
            color: #1BA39C !important; 
          }
          
          .bg-info-soft { 
            background-color: rgba(0, 188, 212, 0.1) !important; 
            color: #00BCD4 !important; 
          }
          
          .bg-success-soft { 
            background-color: rgba(76, 175, 80, 0.1) !important; 
            color: #4CAF50 !important; 
          }
          
          .bg-warning-soft { 
            background-color: rgba(245, 124, 0, 0.1) !important; 
            color: #F57C00 !important; 
          }
          
          .bg-danger-soft { 
            background-color: rgba(220, 53, 69, 0.1) !important; 
            color: #dc3545 !important; 
          }
          
          /* Text colors */
          .text-primary {
            color: #1BA39C !important;
          }
          
          /* Background colors */
          body {
            background-color: #FAFAFA;
          }
          
          .card {
            background-color: #FFFFFF;
          }
          
          /* Progress bars */
          .progress-bar.bg-primary {
            background-color: #1BA39C !important;
          }
          
          .progress-bar.bg-info {
            background-color: #00BCD4 !important;
          }
          
          .progress-bar.bg-success {
            background-color: #4CAF50 !important;
          }
          
          .progress-bar.bg-warning {
            background-color: #F57C00 !important;
          }
          
          /* Nav tabs */
          .nav-tabs .nav-link.active {
            color: #1BA39C !important;
            border-color: #1BA39C !important;
          }
          
          .nav-tabs .nav-link:hover {
            border-color: #1BA39C !important;
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;