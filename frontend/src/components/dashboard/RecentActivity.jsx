import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RecentActivity = ({ activities = [] }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Invalid date';
    return new Intl.DateTimeFormat('fr-TN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={16} className="text-success" />;
      case 'sent':
        return <Clock size={16} className="text-primary" />;
      case 'cancelled':
        return <XCircle size={16} className="text-danger" />;
      case 'draft':
        return <FileText size={16} className="text-secondary" />;
      default:
        return <Clock size={16} className="text-secondary" />;
    }
  };

  // Get status class based on status
  const getStatusClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-light-success text-success';
      case 'sent':
        return 'bg-light-primary text-primary';
      case 'cancelled':
        return 'bg-light-danger text-danger';
      case 'draft':
        return 'bg-light-secondary text-secondary';
      default:
        return 'bg-light-secondary text-secondary';
    }
  };

  // Get status translation
  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'paid';
      case 'sent':
        return 'sent';
      case 'cancelled':
        return 'cancelled';
      case 'draft':
        return 'draft';
      default:
        return status;
    }
  };

  // If no activities provided, show placeholders
  const displayActivities = activities.length > 0 ? activities : [
    { 
      id: 1, 
      action: 'Invoice created',
      entityName: 'Client Company',
      entityId: 'INV-2023-01', 
      date: new Date(), 
      amount: 2000, 
      status: 'sent' 
    },
    { 
      id: 2, 
      action: 'Expense recorded',
      entityName: 'Office Supplies',
      entityId: 'EXP-2023-02', 
      date: new Date(Date.now() - 86400000), 
      amount: 785, 
      status: 'paid' 
    }
  ];

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0 fw-semibold">Recent Activities</h5>
      </div>
      <div className="card-body">
        {displayActivities.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">No activities to show</p>
          </div>
        ) : (
          <div className="activity-list">
            {displayActivities.map((activity, index) => (
              <div 
                key={activity.id || index} 
                className="d-flex align-items-start mb-3 pb-3 border-bottom"
              >
                <div className="me-3">
                  <div className="p-2 rounded-circle bg-light-secondary">
                    {getStatusIcon(activity.status)}
                  </div>
                </div>
                
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fs-6 fw-semibold">{activity.action}</h6>
                    <small className="text-muted">{formatDate(activity.date)}</small>
                  </div>
                  
                  <p className="mb-1 text-muted small">
                    {activity.entityName} - <span className="fw-medium">#{activity.entityId}</span>
                  </p>
                  
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <span className="fw-medium">{formatCurrency(activity.amount)}</span>
                    <span className={`badge ${getStatusClass(activity.status)} d-flex align-items-center`}>
                      {getStatusIcon(activity.status)}
                      <span className="ms-1">{getStatusText(activity.status)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {displayActivities.length > 0 && (
          <div className="text-center mt-2">
            <Link
              to="/admin/expenses"
              className="btn btn-link btn-sm text-decoration-none"
            >
              Show all activities
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
