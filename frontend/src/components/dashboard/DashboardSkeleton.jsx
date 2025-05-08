// import React from 'react';

// const DashboardSkeleton = () => {
//   const SkeletonItem = ({ className }) => (
//     <div className={`bg-gray-200 rounded-md animate-pulse ${className}`}></div>
//   );

//   const StatCardSkeleton = () => (
//     <div className="bg-white p-4 rounded-lg shadow-sm">
//       <div className="flex justify-between items-start mb-2">
//         <SkeletonItem className="h-4 w-24" />
//         <SkeletonItem className="h-5 w-5 rounded-full" />
//       </div>
//       <SkeletonItem className="h-8 w-20 mt-2" />
//       <SkeletonItem className="h-3 w-16 mt-2" />
//     </div>
//   );

//   return (
//     <div className="p-4 md:p-6 bg-gray-50 min-h-screen space-y-6">
//       {/* Header Skeleton */}
//       <div className="flex justify-between">
//         <div>
//           <SkeletonItem className="h-8 w-64 mb-2" />
//           <SkeletonItem className="h-4 w-48" />
//         </div>
//         <SkeletonItem className="h-10 w-32" />
//       </div>
     
//       {/* Stats Cards - First Row using flex */}
//       <div className="flex flex-wrap gap-4">
//         {[...Array(4)].map((_, i) => (
//           <div key={`stat-1-${i}`} className="flex-1 min-w-[220px]">
//             <StatCardSkeleton />
//           </div>
//         ))}
//       </div>

//       {/* Stats Cards - Second Row using flex */}
//       <div className="flex flex-wrap gap-4">
//         {[...Array(4)].map((_, i) => (
//           <div key={`stat-2-${i}`} className="flex-1 min-w-[220px]">
//             <StatCardSkeleton />
//           </div>
//         ))}
//       </div>
     
//       {/* Financial Trends and Recent Activity Skeletons */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-4 rounded-lg shadow-sm">
//           <SkeletonItem className="h-6 w-48 mb-4" />
//           <SkeletonItem className="h-64 w-full" />
//         </div>
//         <div className="bg-white p-4 rounded-lg shadow-sm">
//           <SkeletonItem className="h-6 w-48 mb-4" />
//           <div className="space-y-4">
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="flex items-center space-x-3">
//                 <SkeletonItem className="h-10 w-10 rounded-full" />
//                 <div className="flex-1 space-y-2">
//                   <SkeletonItem className="h-4 w-3/4" />
//                   <SkeletonItem className="h-4 w-1/2" />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardSkeleton;