import React from 'react';
import { TrendingDownIcon } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@material-tailwind/react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

const ExpensesOverview = ({ data }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const chartData = [
    {
      name: 'This Month',
      value: Math.min(100, (data.thisMonth / 10000) * 100),
      fill: '#EF4444'
    },
    {
      name: 'This Year',
      value: Math.min(100, (data.thisYear / 100000) * 100),
      fill: '#F97316'
    }
  ];

  return (
    <Card className="h-full shadow-lg rounded-xl">
      <CardHeader floated={false} className="bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Dépenses</h3>
          <TrendingDownIcon className="h-5 w-5 text-red-500" />
        </div>
      </CardHeader>
      <CardBody className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="60%"
                outerRadius="100%"
                data={chartData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-lg font-bold"
                >
                  {formatCurrency(data.thisMonth)}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-center text-sm text-gray-500">Ce mois</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-4">
              <p className="text-sm text-gray-500">Année en cours</p>
              <p className="text-2xl font-bold text-orange-500">
                {formatCurrency(data.thisYear)}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Économies potentielles:</span> {formatCurrency(data.thisYear * 0.15)}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default ExpensesOverview;