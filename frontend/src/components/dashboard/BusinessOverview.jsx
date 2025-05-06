import React from 'react';
import { BuildingIcon, UsersIcon, BriefcaseIcon } from 'lucide-react';
import CountUp from 'react-countup';
import { Card, CardHeader, CardBody, CardFooter } from '@material-tailwind/react';

const BusinessOverview = ({ data }) => {
  const metrics = [
    {
      name: 'Comptables Assignés',
      value: data.accountantCount,
      icon: <UsersIcon className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Entreprises',
      value: data.businessCount,
      icon: <BuildingIcon className="h-6 w-6 text-purple-600" />,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      name: 'Type d\'Entreprise',
      value: data.businessType,
      icon: <BriefcaseIcon className="h-6 w-6 text-green-600" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      isText: true
    }
  ];

  return (
    <Card className="h-full shadow-lg rounded-xl">
      <CardHeader floated={false} className="bg-gray-50 p-4">
        <h3 className="text-lg font-semibold text-gray-800">Aperçu de l'Entreprise</h3>
      </CardHeader>
      <CardBody className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center p-3 rounded-lg transition-all hover:shadow-md">
              <div className={`p-3 rounded-full ${metric.bgColor} ${metric.textColor} mr-4`}>
                {metric.icon}
              </div>
              <div>
                <h4 className="text-sm text-gray-500">{metric.name}</h4>
                {metric.isText ? (
                  <p className="text-lg font-semibold">{metric.value}</p>
                ) : (
                  <CountUp 
                    end={metric.value} 
                    duration={2} 
                    className="text-lg font-semibold"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardBody>
      <CardFooter className="p-4 border-t border-gray-100">
        <div className="flex items-center">
          <BuildingIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h4 className="text-sm font-medium text-gray-700">{data.businessName}</h4>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BusinessOverview;