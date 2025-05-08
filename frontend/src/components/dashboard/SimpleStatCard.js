// import React from 'react';
// import CountUp from 'react-countup';

// const SimpleStatCard = ({ title, value, subtitle, icon, iconColor }) => {
//   return (
//     <div className="bg-white p-4 rounded-lg shadow-sm w-full">
//       <div className="flex justify-between items-center mb-2">
//         <span className="text-sm font-medium text-gray-500">{title}</span>
//         {icon && (
//           <div className={`w-8 h-8 flex items-center justify-center rounded-full ${iconColor}`}>
//             {icon}
//           </div>
//         )}
//       </div>
      
//       <div className="mt-2">
//         <div className="text-2xl font-bold text-gray-900">
//           {typeof value === 'number' ? (
//             <CountUp end={value} duration={2} separator="," />
//           ) : (
//             value
//           )}
//         </div>
//         {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
//       </div>
//     </div>
//   );
// };

// export default SimpleStatCard;