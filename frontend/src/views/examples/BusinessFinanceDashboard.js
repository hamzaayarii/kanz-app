import React, { useState, useEffect } from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js';
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Button,
  FormGroup,
  Input,
  Alert
} from 'reactstrap';
import { chartOptions, parseOptions } from 'variables/charts';
import Dashboard from './Dashboard'; // Import the modified Dashboard component

const BusinessFinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [forecastData, setForecastData] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [loading, setLoading] = useState({
    businesses: true,
    forecast: false
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBusinesses = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/auth/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/business/user-businesses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBusinesses(response.data.businesses || []);
        if (response.data.businesses?.length > 0) {
          setSelectedBusinessId(response.data.businesses[0]._id);
        }
      } catch (err) {
        setError('Failed to load businesses. Please try again later.');
        console.error(err);
      } finally {
        setLoading(prev => ({ ...prev, businesses: false }));
      }
    };

    fetchBusinesses();

    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }
  }, [navigate]);

  const fetchForecastData = async () => {
    if (!selectedBusinessId) {
      setError('Please select a business.');
      return;
    }

    setLoading(prev => ({ ...prev, forecast: true }));
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:5000/api/predictCashFlow?business=${selectedBusinessId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForecastData(response.data);
    } catch (err) {
      setError('Error fetching forecast data. Please try again.');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, forecast: false }));
    }
  };

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const selectedBusiness = businesses.find(b => b._id === selectedBusinessId);

  return (
    <Container className="mt-4" fluid>
      <Row>
        <Col>
          <Card className="shadow">
            <CardHeader className="border-0">
              <Row className="align-items-center">
                <Col xs="8">
                  <Nav tabs>
                    <NavItem>
                      <NavLink
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => toggleTab('dashboard')}
                      >
                        <i className="ni ni-chart-bar-32 mr-2" />
                        Dashboard Stats
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={activeTab === 'forecast' ? 'active' : ''}
                        onClick={() => toggleTab('forecast')}
                      >
                        <i className="ni ni-chart-pie-35 mr-2" />
                        Cash Flow Forecast
                      </NavLink>
                    </NavItem>
                  </Nav>
                </Col>
                <Col xs="4" className="text-right">
                  <FormGroup className="mb-0">
                    <Input
                      type="select"
                      bsSize="sm"
                      value={selectedBusinessId}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      disabled={loading.businesses}
                    >
                      {loading.businesses ? (
                        <option>Loading businesses...</option>
                      ) : (
                        <>
                          <option value="">Select Business</option>
                          {businesses.map(business => (
                            <option key={business._id} value={business._id}>
                              {business.name}
                            </option>
                          ))}
                        </>
                      )}
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              {error && <Alert color="danger">{error}</Alert>}

              <TabContent activeTab={activeTab}>
                <TabPane tabId="dashboard">
                  {loading.businesses ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                      <p className="mt-2">Loading businesses...</p>
                    </div>
                  ) : selectedBusinessId ? (
                    <Dashboard businessId={selectedBusinessId} />
                  ) : (
                    <div className="text-center py-4">
                      <p>Please select a business to view the dashboard.</p>
                    </div>
                  )}
                </TabPane>
                <TabPane tabId="forecast">
                  {activeTab === 'forecast' && (
                    <>
                      <Button
                        color="primary"
                        onClick={fetchForecastData}
                        disabled={loading.forecast || !selectedBusinessId}
                        className="mb-4"
                      >
                        {loading.forecast ? 'Loading...' : 'Generate Forecast'}
                      </Button>

                      {forecastData && (
                        <div>
                          <h4 className="mb-3">
                            Forecast for: {selectedBusiness?.name || 'Selected Business'}
                          </h4>
                          <div className="chart">
                            <Line
                              data={{
                                labels: forecastData.forecast.map(item => item.date),
                                datasets: [
                                  {
                                    label: 'Inflows',
                                    data: forecastData.forecast.map(item => item.totalInflows),
                                    borderColor: '#00c6ff',
                                    backgroundColor: 'rgba(0, 198, 255, 0.2)',
                                    tension: 0.4,
                                  },
                                  {
                                    label: 'Outflows',
                                    data: forecastData.forecast.map(item => item.totalOutflows),
                                    borderColor: '#f5365c',
                                    backgroundColor: 'rgba(245, 54, 92, 0.3)',
                                    tension: 0.4,
                                  },
                                  {
                                    label: 'Closing Balance',
                                    data: forecastData.forecast.map(item => item.closingBalance),
                                    borderColor: '#f4b400',
                                    backgroundColor: 'rgba(244, 180, 0, 0.3)',
                                    tension: 0.4,
                                  }
                                ]
                              }}
                              options={chartOptions()}
                            />
                          </div>

                          {forecastData.alerts?.length > 0 && (
                            <div className="mt-4">
                              <h5>Alerts</h5>
                              <div className="alert alert-warning">
                                <ul className="mb-0">
                                  {forecastData.alerts.map((alert, index) => (
                                    <li key={index}>
                                      <strong>{alert.type}</strong> on {alert.date}:{' '}
                                      {alert.predicted_cashflow.toLocaleString(undefined, {
                                        style: 'currency',
                                        currency: 'USD'
                                      })}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BusinessFinanceDashboard;