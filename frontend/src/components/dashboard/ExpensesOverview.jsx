// ExpensesOverview.jsx
import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';

const ExpensesOverview = ({ data = { thisMonth: 1000, thisYear: 12000 } }) => {
  const [selectedView, setSelectedView] = useState('month');
  
  // Simple formatter for Tunisian Dinar
  const formatCurrency = (amount) => {
    return `${amount} DT`;
  };

  // Sample data for charts - you should replace this with your actual data
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Expenses',
        data: [850, 920, 880, 1100, 1050, 980, 950, 900, 1200, 1100, 950, data.thisMonth],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const yearlyData = {
    labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
    datasets: [
      {
        label: 'Yearly Expenses',
        data: [8500, 9200, 10500, 11000, 11500, data.thisYear],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10,
          },
        }
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10,
          },
          callback: function(value) {
            return value + ' DT';
          }
        },
        beginAtZero: true
      }
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '0.75rem', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              backgroundColor: '#fee2e2', 
              borderRadius: '9999px', 
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Simple down arrow icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                <polyline points="17 18 23 18 23 12"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Expenses</h3>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              {/* Info icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSelectedView('month')}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: '9999px',
                transition: 'all 0.3s ease',
                backgroundColor: selectedView === 'month' ? '#ef4444' : '#f3f4f6',
                color: selectedView === 'month' ? 'white' : '#4b5563',
                boxShadow: selectedView === 'month' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Month
            </button>
            <button
              onClick={() => setSelectedView('year')}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: '9999px',
                transition: 'all 0.3s ease',
                backgroundColor: selectedView === 'year' ? '#ef4444' : '#f3f4f6',
                color: selectedView === 'year' ? 'white' : '#4b5563',
                boxShadow: selectedView === 'year' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {/* Chart */}
          <div style={{ 
            height: '200px', 
            borderRadius: '0.5rem'
          }}>
            {selectedView === 'month' ? (
              <Line data={monthlyData} options={chartOptions} />
            ) : (
              <Line data={yearlyData} options={chartOptions} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Current expenses */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
              border: '1px solid #f3f4f6' 
            }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                {selectedView === 'month' ? 'This month' : 'This year'}
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                {formatCurrency(selectedView === 'month' ? data.thisMonth : data.thisYear)}
              </p>
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#4b5563' }}>
                {/* Down arrow icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.25rem' }}>
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                  <polyline points="17 18 23 18 23 12"></polyline>
                </svg>
                <span>-12% compared to the previous period</span>
              </div>
            </div>

            {/* Saving opportunities */}
            <div style={{ 
              backgroundColor: '#fef2f2', 
              padding: '1rem', 
              borderRadius: '0.75rem', 
              border: '1px solid #fee2e2' 
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#b91c1c', marginBottom: '0.5rem' }}>
                Savings opportunities
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>
                Estimated savings potential: {' '}
                <span style={{ fontWeight: '600' }}>
                  {formatCurrency((selectedView === 'month' ? data.thisMonth : data.thisYear) * 0.15)}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesOverview;