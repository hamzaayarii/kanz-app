import React from 'react';
import { Card, CardHeader, CardBody, Badge } from 'reactstrap';
import { format } from 'date-fns';
import './TaxDeadlinesPanel.css';

const TaxDeadlinesPanel = ({ deadlines }) => {
  if (!deadlines || deadlines.length === 0) {
    return (
      <Card className="tax-deadlines-panel">
        <CardHeader>
          <h5 className="mb-0">Upcoming Tax Deadlines</h5>
        </CardHeader>
        <CardBody>
          <p className="text-muted">No upcoming tax deadlines for your business type.</p>
        </CardBody>
      </Card>
    );
  }

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'critical':
        return <Badge color="danger">Critical</Badge>;
      case 'high':
        return <Badge color="warning">High</Badge>;
      case 'medium':
        return <Badge color="primary">Medium</Badge>;
      default:
        return <Badge color="info">Regular</Badge>;
    }
  };

  const getCategoryBadge = (category) => {
    switch(category) {
      case 'vat':
        return <Badge color="info">VAT</Badge>;
      case 'income':
        return <Badge color="success">Income</Badge>;
      case 'corporate':
        return <Badge color="secondary">Corporate</Badge>;
      case 'personal':
        return <Badge color="primary">Personal</Badge>;
      case 'social':
        return <Badge color="dark">Social</Badge>;
      default:
        return <Badge color="light">Other</Badge>;
    }
  };

  const getDaysRemaining = (date) => {
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card className="tax-deadlines-panel">
      <CardHeader>
        <h5 className="mb-0">Upcoming Tax Deadlines</h5>
      </CardHeader>
      <CardBody>
        <div className="deadlines-list">
          {deadlines.map(deadline => {
            const daysRemaining = getDaysRemaining(deadline.dueDate);
            const isUrgent = daysRemaining <= 7;
            
            return (
              <div key={deadline.id} className={`deadline-item ${isUrgent ? 'urgent' : ''}`}>
                <div className="deadline-header">
                  <div className="deadline-title">
                    {deadline.title}
                  </div>
                  <div className="deadline-badges">
                    {getPriorityBadge(deadline.priority)}
                    {getCategoryBadge(deadline.category)}
                  </div>
                </div>
                
                <div className="deadline-date">
                  Due: {format(deadline.dueDate, 'MMMM d, yyyy')}
                  <span className={`days-remaining ${isUrgent ? 'text-danger' : ''}`}>
                    ({daysRemaining} days remaining)
                  </span>
                </div>
                
                <div className="deadline-description">
                  {deadline.description}
                </div>
                
                {isUrgent && (
                  <div className="deadline-warning">
                    <i className="fas fa-exclamation-circle"></i> {deadline.penalties}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default TaxDeadlinesPanel;
