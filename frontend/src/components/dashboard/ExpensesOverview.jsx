// ExpensesOverview.jsx
import React, { useState } from 'react';

const ExpensesOverview = ({ data = { thisMonth: 1000, thisYear: 12000 } }) => {
  const [selectedView, setSelectedView] = useState('month');
  
  // Simple formatter for Tunisian Dinar
  const formatCurrency = (amount) => {
    return `${amount} DT`;
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
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937' }}>Dépenses</h3>
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
              Mois
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
              Année
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          {/* Chart placeholder */}
          <div style={{ 
            height: '200px', 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            {selectedView === 'month' ? 'Graphique des dépenses mensuelles' : 'Graphique des dépenses annuelles'}
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
                {selectedView === 'month' ? 'Ce mois' : 'Cette année'}
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
                <span>-12% par rapport à la période précédente</span>
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
                Opportunités d'économies
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>
                Potentiel d'économie estimé: {' '}
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