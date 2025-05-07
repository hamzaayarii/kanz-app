// import React from 'react';
// import CountUp from 'react-countup';

// const StatCard = ({ title, value, subtitle, icon, color = 'blue', isCountUp = true }) => {
//   // Map text color class based on color prop
//   const getTextColorClass = (colorName) => {
//     const colorMap = {
//       'blue': 'text-blue-500',
//       'green': 'text-green-500',
//       'red': 'text-red-500',
//       'amber': 'text-amber-500',
//       'indigo': 'text-indigo-500',
//       'purple': 'text-purple-500'
//     };
//     return colorMap[colorName] || 'text-blue-500';
//   };

//   return (
//     <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col h-full w-full">
//       <div className="flex justify-between items-start mb-2">
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         {icon && (
//           <span className={getTextColorClass(color)}>
//             {icon}
//           </span>
//         )}
//       </div>
//       <div className="mt-1">
//         {isCountUp ? (
//           <CountUp 
//             end={value} 
//             duration={2} 
//             className="text-2xl font-bold text-gray-900"
//             separator=","
//           />
//         ) : (
//           <p className="text-2xl font-bold text-gray-900">{value}</p>
//         )}
//         {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
//       </div>
//     </div>
//   );
// };

// export default StatCard;