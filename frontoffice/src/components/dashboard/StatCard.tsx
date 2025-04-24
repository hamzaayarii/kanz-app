import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: { value: string; isPositive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, change }) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white p-5 shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="rounded-md bg-primary-100 p-3 text-primary-600">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {change && (
        <div className="mt-4">
          <span
            className={`inline-flex items-center text-sm font-medium ${
              change.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change.value}
            <svg
              className={`ml-1 h-4 w-4 ${
                change.isPositive ? 'text-green-500' : 'text-red-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  change.isPositive
                    ? 'M5 10l7-7m0 0l7 7m-7-7v18'
                    : 'M19 14l-7 7m0 0l-7-7m7 7V3'
                }
              ></path>
            </svg>
          </span>
          <span className="text-sm text-gray-500 ml-1">from last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;