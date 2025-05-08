import React from 'react';
import { BuildingIcon, UsersIcon, BriefcaseIcon } from 'lucide-react';
import CountUp from 'react-countup';

const BusinessOverview = ({ data }) => {
  const metrics = [
    {
      name: 'Accountants',
      value: data.accountantCount,
      icon: <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Businesses',
      value: data.businessCount,
      icon: <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4" /></svg>,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      name: 'Type',
      value: data.businessType,
      icon: <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10m0 0v10m0-10L7 17" /></svg>,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      isText: true
    }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Business Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {metrics.map((metric, index) => (
          <div key={index} className={`p-3 rounded-md ${metric.bgColor} flex flex-col`}>
            <div className="flex items-center gap-2 mb-1">
              {metric.icon}
              <h4 className="text-xs text-gray-600">{metric.name}</h4>
            </div>
            {metric.isText ? (
              <p className={`text-sm font-medium ${metric.textColor}`}>{metric.value}</p>
            ) : (
              <CountUp end={metric.value} duration={2} className={`text-lg font-bold ${metric.textColor}`} />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center">
        <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4" /></svg>
        <p className="text-sm text-gray-700">{data.businessName}</p>
      </div>
    </div>
  );
};

export default BusinessOverview;