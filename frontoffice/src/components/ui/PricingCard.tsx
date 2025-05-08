import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Button from './Button';

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonType: 'primary' | 'secondary' | 'accent';
  popular?: boolean;
  delay: number;
  inView: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonType,
  popular = false,
  delay,
  inView,
}) => {
  return (
    <motion.div
      className={`glass rounded-xl overflow-hidden transition-all duration-300 ${
        popular ? 'border-kanz-accent-500 border-2' : 'border border-white/10'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
    >
      {popular && (
        <div className="bg-kanz-accent-500 text-white py-1 px-4 text-center text-sm font-medium">
          Most Popular
        </div>
      )}
      
      <div className="p-8">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-gray-400">{period}</span>
        </div>
        <p className="text-gray-400 mb-6">{description}</p>
        
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-green-400 mt-1"><Check size={16} /></span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button type={buttonType} fullWidth href="#checkout">
          {buttonText}
        </Button>
        
        <p className="text-center text-sm text-gray-400 mt-4">
          Includes 15-day free trial
        </p>
      </div>
    </motion.div>
  );
};

export default PricingCard;