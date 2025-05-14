import React from 'react';
import { Users, Building2, Briefcase } from 'lucide-react';

const BusinessOverview = ({ data }) => {
  const { accountantCount, businessCount, businessName, businessType } = data || {};

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0 fw-semibold">Business Overview</h5>
      </div>
      <div className="card-body">
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center mb-3">
            <div className="avatar-group">
              <div className="avatar bg-light-primary p-2 rounded-circle">
                <Building2 size={40} className="text-primary" />
              </div>
            </div>
          </div>
          <h4 className="fw-bold mb-1">{businessName || 'Your Business'}</h4>
          <p className="text-muted">{businessType || 'Not specified'}</p>
        </div>

        <div className="row g-3">
          <div className="col-6">
            <div className="d-flex align-items-center p-2 rounded bg-light-secondary">
              <div className="me-2">
                <Users size={20} className="text-secondary" />
              </div>
              <div>
                <p className="mb-0 small">Accountants</p>
                <h6 className="mb-0 fw-bold">{accountantCount || 0}</h6>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center p-2 rounded bg-light-info">
              <div className="me-2">
                <Briefcase size={20} className="text-info" />
              </div>
              <div>
                <p className="mb-0 small">Businesses</p>
                <h6 className="mb-0 fw-bold">{businessCount || 0}</h6>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessOverview;