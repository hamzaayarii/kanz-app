import React from 'react';
import { Card } from '@material-tailwind/react';

const DashboardSkeleton = () => {
  const SkeletonItem = ({ className }) => (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`}></div>
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">
      {/* Header Skeleton */}
      <SkeletonItem className="h-8 w-64 mb-6" />
      
      {/* Financial Overview Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 h-48">
            <SkeletonItem className="h-5 w-1/2 mb-4" />
            <SkeletonItem className="h-8 w-3/4 mb-2" />
            <SkeletonItem className="h-4 w-1/3" />
          </Card>
        ))}
      </div>
      
      {/* Business Overview and Transactions Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <SkeletonItem className="h-5 w-1/3 mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <SkeletonItem className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <SkeletonItem className="h-4 w-3/4" />
                  <SkeletonItem className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <SkeletonItem className="h-5 w-1/3 mb-4" />
          <div className="h-48">
            <SkeletonItem className="h-full w-full" />
          </div>
        </Card>
      </div>
      
      {/* Financial Trends Skeleton */}
      <Card className="p-4">
        <SkeletonItem className="h-5 w-1/4 mb-4" />
        <SkeletonItem className="h-64 w-full" />
      </Card>
    </div>
  );
};

export default DashboardSkeleton;