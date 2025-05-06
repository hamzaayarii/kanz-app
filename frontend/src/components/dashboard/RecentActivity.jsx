import React from 'react';
import { FileTextIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, XCircleIcon } from 'lucide-react';

const RecentActivity = ({ activities }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'sent':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <FileTextIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status class based on status
  const getStatusClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Activités Récentes</h3>
      
      {activities.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">Aucune activité récente à afficher</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id || index} 
              className="flex items-start p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 mr-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileTextIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900">{activity.action}</h4>
                  <span className="text-xs text-gray-500">{formatDate(activity.date)}</span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {activity.entityName} - <span className="font-medium">#{activity.entityId}</span>
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">{formatCurrency(activity.amount)}</span>
                  <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getStatusClass(activity.status)}`}>
                    {getStatusIcon(activity.status)}
                    <span className="ml-1 capitalize">
                      {activity.status === 'paid' ? 'Payée' : 
                       activity.status === 'sent' ? 'Envoyée' :
                       activity.status === 'draft' ? 'Brouillon' : 'Annulée'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activities.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Voir toutes les activités
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;