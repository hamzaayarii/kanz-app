// InventoryInsightsChart.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";


const InventoryInsightsChart = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('productTypes'); // productTypes, taxCategory, margins, value
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");
  // Color palette - using colors that match Argon dashboard theme
  const chartColors = {
    blue: '#5e72e4',
    lightBlue: '#11cdef',
    yellow: '#ffd600',
    red: '#f5365c',
    green: '#2dce89',
    purple: '#8965e0',
    orange: '#fb6340'
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/products/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatsData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
        setError(error.message);
        setLoading(false);
        
        // Optional: Provide mock data for development
        if (process.env.NODE_ENV === 'development') {
          setStatsData({
            productTypeStats: [
              { _id: 'Goods', count: 12 },
              { _id: 'Service', count: 8 }
            ],
            taxCategoryStats: [
              { _id: 'TVA19', count: 10 },
              { _id: 'TVA13', count: 5 },
              { _id: 'TVA7', count: 3 },
              { _id: 'Exonéré', count: 2 }
            ],
            profitAnalysis: [
              { _id: 'Goods', averageMarginPercentage: 22.5 },
              { _id: 'Service', averageMarginPercentage: 45.3 }
            ],
            inventoryValue: {
              totalCost: 12500,
              totalSales: 18500,
              totalMargin: 6000,
              averageMarginPercentage: 32.4,
              count: 20
            }
          });
          setError(null);
        }
      }
    };

    fetchStats();
  }, [token]); 

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(value);
  };

  const getChartData = () => {
    if (!statsData) return null;
    
    switch(chartType) {
      case 'productTypes':
        return {
          labels: statsData.productTypeStats.map(item => item._id),
          datasets: [
            {
              label: 'Number of Products',
              data: statsData.productTypeStats.map(item => item.count),
              backgroundColor: [chartColors.blue, chartColors.green],
              borderWidth: 0,
              maxBarThickness: 35
            }
          ]
        };
        
      case 'taxCategory':
        return {
          labels: statsData.taxCategoryStats.map(item => item._id),
          datasets: [
            {
              data: statsData.taxCategoryStats.map(item => item.count),
              backgroundColor: [
                chartColors.blue,
                chartColors.lightBlue,
                chartColors.yellow,
                chartColors.green
              ],
              borderWidth: 0
            }
          ]
        };
        
      case 'margins':
        return {
          labels: statsData.profitAnalysis.map(item => item._id),
          datasets: [
            {
              label: 'Average Margin (%)',
              data: statsData.profitAnalysis.map(item => item.averageMarginPercentage),
              backgroundColor: [chartColors.green, chartColors.blue],
              borderWidth: 0,
              maxBarThickness: 35
            }
          ]
        };
        
      case 'value':
        return {
          labels: ['Purchase Cost', 'Selling Value', 'Profit Margin'],
          datasets: [
            {
              label: 'Inventory Value',
              data: [
                statsData.inventoryValue.totalCost,
                statsData.inventoryValue.totalSales,
                statsData.inventoryValue.totalMargin
              ],
              backgroundColor: [
                chartColors.blue,
                chartColors.green,
                chartColors.yellow
              ],
              borderWidth: 0,
              maxBarThickness: 35
            }
          ]
        };
        
      default:
        return null;
    }
  };

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: chartType === 'taxCategory',
        position: 'bottom',
      },
      tooltips: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(tooltipItem, data) {
            let label = '';
            
            if (chartType === 'taxCategory') {
              label = data.labels[tooltipItem.index] || '';
              if (label) {
                label += ': ';
              }
            } else {
              label = data.datasets[tooltipItem.datasetIndex].label || '';
              if (label) {
                label += ': ';
              }
            }
            
            if (chartType === 'margins') {
              label += tooltipItem.yLabel.toFixed(2) + '%';
            } else if (chartType === 'value') {
              label += formatCurrency(tooltipItem.yLabel);
            } else {
              label += tooltipItem.yLabel;
            }
            return label;
          }
        }
      }
    };
    
    // Add specific options based on chart type
    if (chartType === 'taxCategory') {
      return {
        ...baseOptions,
        cutoutPercentage: 50,
      };
    }
    
    return {
      ...baseOptions,
      scales: {
        yAxes: [{
          gridLines: {
            color: "rgba(0, 0, 0, 0.1)",
            zeroLineColor: "rgba(0, 0, 0, 0.1)"
          },
          ticks: {
            beginAtZero: true,
            callback: function(value) {
              if (chartType === 'margins') {
                return value + '%';
              } else if (chartType === 'value') {
                return value >= 1000 ? (value / 1000) + 'k €' : value + ' €';
              }
              return value;
            }
          }
        }],
        xAxes: [{
          gridLines: {
            display: false
          }
        }]
      }
    };
  };

  const renderChart = () => {
    if (loading) {
      return <div className="text-center py-5">Loading data...</div>;
    }
    
    if (error) {
      return <div className="text-center py-5 text-danger">{error}</div>;
    }
    
    if (!statsData) {
      return <div className="text-center py-5">No data available</div>;
    }
    
    const chartData = getChartData();
    const chartOptions = getChartOptions();
    
    if (chartType === 'taxCategory') {
      return <Pie data={chartData} options={chartOptions} />;
    }
    
    return <Bar data={chartData} options={chartOptions} />;
  };

  const renderSummary = () => {
    if (!statsData || loading || error) return null;
    
    return (
      <Row className="mt-3 text-center">
        <Col xs="6">
          <div className="text-uppercase text-muted mb-1 small">Total Products</div>
          <h3>{statsData.inventoryValue.count}</h3>
        </Col>
        <Col xs="6">
          <div className="text-uppercase text-muted mb-1 small">Average Margin</div>
          <h3 className={statsData.inventoryValue.averageMarginPercentage > 20 ? "text-success" : "text-warning"}>
            {statsData.inventoryValue.averageMarginPercentage.toFixed(2)}%
          </h3>
        </Col>
      </Row>
    );
  };

  return (
    <Card className="shadow">
      <CardHeader className="bg-transparent">
        <Row className="align-items-center">
          <div className="col">
            <h6 className="text-uppercase text-muted ls-1 mb-1">
              Business Insights
            </h6>
            <h2 className="mb-0">Inventory Analysis</h2>
          </div>
          <div className="col text-right">
            <UncontrolledDropdown>
              <DropdownToggle
                className="btn-sm"
                color="primary"
                type="button"
              >
                {chartType === 'productTypes' && 'Product Types'}
                {chartType === 'taxCategory' && 'Tax Categories'}
                {chartType === 'margins' && 'Profit Margins'}
                {chartType === 'value' && 'Inventory Value'}
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem onClick={(e) => {e.preventDefault(); setChartType('productTypes');}}>
                  Product Types
                </DropdownItem>
                <DropdownItem onClick={(e) => {e.preventDefault(); setChartType('taxCategory');}}>
                  Tax Categories
                </DropdownItem>
                <DropdownItem onClick={(e) => {e.preventDefault(); setChartType('margins');}}>
                  Profit Margins
                </DropdownItem>
                <DropdownItem onClick={(e) => {e.preventDefault(); setChartType('value');}}>
                  Inventory Value
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </div>
        </Row>
      </CardHeader>
      <CardBody>
        <div className="chart" style={{ height: '250px' }}>
          {renderChart()}
        </div>
        {renderSummary()}
      </CardBody>
    </Card>
  );
};

export default InventoryInsightsChart;