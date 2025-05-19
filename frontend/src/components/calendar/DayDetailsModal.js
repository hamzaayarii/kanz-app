import React from 'react';
import { format } from 'date-fns';
import './DayDetailsModal.css';

const DayDetailsModal = ({ isOpen, onClose, date, details, isLoading, taxDeadlines = [] }) => {
  if (!isOpen) return null;
  
  // Format date without timezone conversion
  const formatDate = (dateObj) => {
    return format(dateObj, 'MMMM d, yyyy');
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'critical': return 'tax-priority-critical';
      case 'high': return 'tax-priority-high';
      case 'medium': return 'tax-priority-medium';
      default: return 'tax-priority-low';
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="day-details-modal">
        <div className="modal-header">
          <h2>Financial Details: {formatDate(date)}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {/* Tax Deadlines Section */}
          {taxDeadlines && taxDeadlines.length > 0 && (
            <div className="tax-deadlines-section">
              <h3 className="section-title">Tax Deadlines</h3>
              <div className="tax-deadlines-list">
                {taxDeadlines.map((deadline, index) => (
                  <div key={index} className={`tax-deadline-item ${getPriorityClass(deadline.priority)}`}>
                    <div className="tax-deadline-header">
                      <span className="tax-deadline-title">{deadline.title}</span>
                      <span className={`tax-deadline-priority ${getPriorityClass(deadline.priority)}`}>
                        {deadline.priority}
                      </span>
                    </div>
                    <div className="tax-deadline-description">{deadline.description}</div>
                    <div className="tax-deadline-penalties">Warning: {deadline.penalties}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="loading-spinner">Loading day details...</div>
          ) : !details ? (
            <div className="no-data-message">No financial data available for this date.</div>
          ) : (
            <>
              <div className="summary-section">
                <h3 className="section-title">Daily Summary</h3>
                <div className="summary-grid">
                  <div className="summary-item revenue">
                    <div className="summary-label">Revenue</div>
                    <div className="summary-value">
                      {details.revenue ? formatCurrency(details.revenue.summary.totalRevenue) : '$0.00'}
                    </div>
                  </div>
                  <div className="summary-item expenses">
                    <div className="summary-label">Expenses</div>
                    <div className="summary-value">
                      {details.expenses && details.expenses.length > 0 ?
                        formatCurrency(details.expenses.reduce((sum, exp) => sum + exp.amount, 0)) :
                        '$0.00'}
                    </div>
                  </div>
                  <div className="summary-item net">
                    <div className="summary-label">Net</div>
                    <div className={`summary-value ${
                      details.revenue && 
                      (details.revenue.summary.totalRevenue - 
                       (details.expenses ? details.expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0)) >= 0 
                        ? 'positive' 
                        : 'negative'
                    }`}>
                      {formatCurrency(
                        (details.revenue ? details.revenue.summary.totalRevenue : 0) - 
                        (details.expenses && details.expenses.length > 0 
                          ? details.expenses.reduce((sum, exp) => sum + exp.amount, 0) 
                          : 0)
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Expense Details Section */}
              {details.expenses && details.expenses.length > 0 && (
                <div className="details-section">
                  <h3 className="section-title">Expense Details</h3>
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.expenses.map((expense, idx) => (
                        <tr key={idx}>
                          <td>{expense.category ? expense.category.name : 'Uncategorized'}</td>
                          <td>{expense.description || 'No description'}</td>
                          <td className="amount-cell">{formatCurrency(expense.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Revenue Details Section */}
              {details.revenue && details.revenue.categories && details.revenue.categories.length > 0 && (
                <div className="details-section">
                  <h3 className="section-title">Revenue Details</h3>
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {details.revenue.categories.map((category, idx) => (
                        <tr key={idx}>
                          <td>{category.name}</td>
                          <td className="amount-cell">{formatCurrency(category.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="close-button-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default DayDetailsModal;