import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import classnames from "classnames";
import Chart from "chart.js";
import {
    Container,
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    Button,
    FormGroup,
    Label,
    Input,
    Alert
} from 'reactstrap';

import { chartOptions, parseOptions } from 'variables/charts';

const PredictCashFlow = () => {
    const [forecastData, setForecastData] = useState(null);
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusinessId, setSelectedBusinessId] = useState('');
    const [loadingBusinesses, setLoadingBusinesses] = useState(true);
    const [loadingForecast, setLoadingForecast] = useState(false);
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
            } catch (err) {
                setError('Failed to load businesses. Please try again later.');
                console.error(err);
            } finally {
                setLoadingBusinesses(false);
            }
        };

        fetchBusinesses();

        if (window.Chart) {
            parseOptions(Chart, chartOptions());
        }
    }, [navigate]);

    const handleFetchPrediction = async () => {
        if (!selectedBusinessId) {
            setError('Please select a business.');
            return;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/auth/login');
            return;
        }

        setLoadingForecast(true);
        setError('');
        try {
            const response = await axios.get(`http://localhost:5000/api/predictCashFlow?business=${selectedBusinessId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setForecastData(response.data);
        } catch (err) {
            setError('Error fetching forecast data. Please try again.');
            console.error(err);
        } finally {
            setLoadingForecast(false);
        }
    };

    return (
        <Container className="mt--7" fluid>
            <Row className="justify-content-center">
                <Col xl="8">
                    <Card className="bg-gradient-default shadow">
                        <CardHeader className="bg-transparent">
                            <h2 className="text-white mb-0">Cashflow Forecast</h2>
                        </CardHeader>
                        <CardBody>
                            {error && (
                                <Alert color="danger">{error}</Alert>
                            )}

                            <FormGroup>
                                <Label for="business-select" className="text-white">Choose a business:</Label>
                                <Input
                                    type="select"
                                    id="business-select"
                                    value={selectedBusinessId}
                                    onChange={(e) => setSelectedBusinessId(e.target.value)}
                                >
                                    <option value="">-- Select a business --</option>
                                    {businesses.map(business => (
                                        <option key={business._id} value={business._id}>
                                            {business.name}
                                        </option>
                                    ))}
                                </Input>
                            </FormGroup>

                            <Button
                                color="info"
                                onClick={handleFetchPrediction}
                                disabled={loadingForecast}
                            >
                                {loadingForecast ? 'Loading...' : 'Display Prediction'}
                            </Button>

                            {forecastData && (
                                <div className="mt-5">
                                    <h3 className="text-white">
                                        Forecast for: {businesses.find(b => b._id === selectedBusinessId)?.name || 'Selected Business'}
                                    </h3>
                                    <div className="chart mt-4">
                                        <Line
                                            data={{
                                                labels: forecastData.forecast.map(item => item.ds),
                                                datasets: [{
                                                    label: 'Forecasted Cashflow',
                                                    data: forecastData.forecast.map(item => item.yhat),
                                                    fill: true,
                                                    borderColor: '#f5365c',
                                                    backgroundColor: 'rgba(245, 54, 92, 0.3)',
                                                    pointBackgroundColor: '#f5365c',
                                                    tension: 0.4,
                                                }]
                                            }}
                                            options={chartOptions()}
                                        />
                                    </div>

                                    {forecastData.alerts?.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-white">Alerts</h4>
                                            <ul className="text-white">
                                                {forecastData.alerts.map(alert => (
                                                    <li key={alert.date}>
                                                        <strong>{alert.type}</strong> on <strong>{alert.date}</strong>:{" "}
                                                        {alert.predicted_cashflow.toLocaleString(undefined, {
                                                            style: 'currency',
                                                            currency: 'USD'
                                                        })}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PredictCashFlow;
