import React from 'react';
import { TrendingUp } from 'lucide-react';

const RevenueOverview = ({ data, period = 'month' }) => {
  const { thisMonth = 0, thisYear = 0 } = data || {};
  const displayValue = period === 'month' ? thisMonth : thisYear;
  
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0 fw-semibold">Revenue</h5>
      </div>
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className="bg-light-primary p-2 rounded me-3">
            <TrendingUp size={24} className="text-primary" />
          </div>
          <div>
            <span className="text-muted small">This {period}</span>
            <h4 className="fw-bold mb-0">{displayValue} DT</h4>
          </div>
        </div>
        
        <div className="d-flex align-items-end">
          <div className="flex-grow-1">
            <div 
              className="progress" 
              style={{ height: '8px' }}
            >
              <div 
                className="progress-bar bg-primary" 
                role="progressbar" 
                style={{ width: '75%' }} 
                aria-valuenow="75" 
                aria-valuemin="0" 
                aria-valuemax="100"
              ></div>
            </div>
          </div>
          <div className="ms-2">
            <span className="badge bg-light-primary text-primary">+12%</span>
          </div>
        </div>
        <span className="text-muted small">Compared to previous {period}</span>
      </div>
    </div>
  );
};

export default RevenueOverview;