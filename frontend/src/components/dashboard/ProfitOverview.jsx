import React from 'react';
import { DollarSign } from 'lucide-react';

const ProfitOverview = ({ data, period = 'month' }) => {
  const { thisMonth = 0, thisYear = 0 } = data || {};
  const displayValue = period === 'month' ? thisMonth : thisYear;
  
  // Format the value to always show a sign (+ or -)
  const formattedValue = displayValue < 0 ? displayValue : `+${displayValue}`;
  const isProfitable = displayValue >= 0;
  
  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0 fw-semibold">Profit Net</h5>
      </div>
      <div className="card-body">
        <div className="d-flex align-items-center mb-3">
          <div className={`bg-light-${isProfitable ? 'success' : 'danger'} p-2 rounded me-3`}>
            <DollarSign size={24} className={`text-${isProfitable ? 'success' : 'danger'}`} />
          </div>
          <div>
            <span className="text-muted small">This {period}</span>
            <h4 className={`fw-bold mb-0 text-${isProfitable ? 'success' : 'danger'}`}>
              {formattedValue} DT
            </h4>
          </div>
        </div>
        
        <div style={{ height: '100px' }}>
          {/* A simple horizontal line showing profit/loss */}
          <div className="position-relative h-100">
            <div className="position-absolute top-50 start-0 end-0" style={{ height: '1px', background: '#e2e8f0' }}></div>
            <div className="position-absolute top-50 start-0 end-0 d-flex justify-content-center">
              <div 
                className={`p-2 rounded-circle bg-light-${isProfitable ? 'success' : 'danger'}`}
                style={{ transform: 'translateY(-50%)' }}
              >
                <span className={`text-${isProfitable ? 'success' : 'danger'}`}>
                  {isProfitable ? '+' : '-'}
                </span>
              </div>
            </div>
            <div className="position-absolute bottom-0 start-0 end-0">
              <div className="progress" style={{ height: '8px' }}>
                <div 
                  className={`progress-bar bg-${isProfitable ? 'success' : 'danger'}`} 
                  role="progressbar" 
                  style={{ width: '70%' }} 
                  aria-valuenow="70" 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="d-flex justify-content-between mt-1">
                <small className="text-muted">This {period}</small>
                <small className="text-muted">Previous {period}</small>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">Year to date</span>
            <h6 className={`mb-0 fw-bold text-${isProfitable ? 'success' : 'danger'}`}>
              {thisYear} DT
            </h6>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitOverview;