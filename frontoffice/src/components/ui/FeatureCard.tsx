import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  inView: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay,
  inView,
}) => {
  return (
    <motion.div
      className="glass rounded-xl p-6 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="w-12 h-12 bg-kanz-500/20 rounded-full flex items-center justify-center mb-6 text-kanz-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;