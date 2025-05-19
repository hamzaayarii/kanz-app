import React from 'react';
import { format } from 'date-fns';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Badge, Alert } from 'reactstrap';
import './TaxAlertModal.css';

const TaxAlertModal = ({ isOpen, toggle, deadline }) => {
  if (!deadline) return null;

  const getDaysRemaining = (date) => {
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(deadline.dueDate);
  const isUrgent = daysRemaining <= 7;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      default: return 'info';
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} className="tax-alert-modal">
      <ModalHeader toggle={toggle}>
        Tax Deadline Alert
      </ModalHeader>
      <ModalBody>
        <div className="alert-title">
          <h4>{deadline.title}</h4>
          <Badge color={getPriorityColor(deadline.priority)}>
            {deadline.priority.charAt(0).toUpperCase() + deadline.priority.slice(1)} Priority
          </Badge>
        </div>

        <div className="alert-due-date">
          <strong>Due Date:</strong> {format(deadline.dueDate, 'MMMM d, yyyy')}
          <span className={`days-remaining ${isUrgent ? 'text-danger' : 'text-warning'}`}>
            ({daysRemaining} days remaining)
          </span>
        </div>

        <div className="alert-description mt-3">
          <p>{deadline.description}</p>
        </div>

        {isUrgent && (
          <Alert color="danger" className="mt-3">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <strong>Warning:</strong> {deadline.penalties}
          </Alert>
        )}

        <div className="alert-actions mt-4">
          <h5>Recommended Actions:</h5>
          <ul>
            <li>Prepare all required documentation</li>
            <li>Verify calculations and amounts</li>
            <li>Consult with your accountant if needed</li>
            <li>Submit before the deadline to avoid penalties</li>
          </ul>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={toggle}>
          Add to My Calendar
        </Button>{' '}
        <Button color="secondary" onClick={toggle}>
          Dismiss
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default TaxAlertModal;
