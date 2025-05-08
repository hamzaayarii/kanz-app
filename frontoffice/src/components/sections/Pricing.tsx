import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, X } from 'lucide-react';
import Button from '../ui/Button';
import PricingCard from '../ui/PricingCard';

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  const basicFeatures = [
    'Dashboard & reports',
    'Up to 100 transactions/month',
    'Basic financial projections',
    'Email support',
    'Data export',
    '2 team members',
  ];
  
  const proFeatures = [
    'Everything in Basic',
    'Unlimited transactions',
    'Advanced financial projections',
    'Priority support',
    'API access',
    'Unlimited team members',
    'Custom branding',
    'Dedicated account manager',
  ];
  
  return (
    <section id="pricing" className="section bg-kanz-dark-950/50" ref={ref}>
      <div className="container">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="heading-lg mb-6">
            <span className="gradient-text">Simple Pricing</span> for Everyone
          </h2>
          <p className="subtitle mx-auto">
            Whether you're a solo entrepreneur or a growing business, we have a plan that's right for you. All plans come with a 15-day free trial.
          </p>
          
          <div className="mt-8 inline-flex items-center p-1 bg-white/5 rounded-full">
            <button
              className={`px-6 py-2 rounded-full transition-all ${
                !isAnnual ? 'bg-kanz-500 text-white' : 'bg-transparent text-white/70'
              }`}
              onClick={() => setIsAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full transition-all ${
                isAnnual ? 'bg-kanz-500 text-white' : 'bg-transparent text-white/70'
              }`}
              onClick={() => setIsAnnual(true)}
            >
              Annual <span className="text-xs">Save 20%</span>
            </button>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            title="Basic"
            price={isAnnual ? "29" : "39"}
            period={isAnnual ? "/month, billed annually" : "/month"}
            description="Perfect for freelancers and small businesses just getting started."
            features={basicFeatures}
            buttonText="Choose Basic"
            buttonType="secondary"
            delay={0.2}
            inView={inView}
          />
          
          <PricingCard
            title="Pro"
            price={isAnnual ? "79" : "99"}
            period={isAnnual ? "/month, billed annually" : "/month"}
            description="Ideal for growing businesses with more complex needs."
            features={proFeatures}
            buttonText="Choose Pro"
            buttonType="primary"
            popular={true}
            delay={0.4}
            inView={inView}
          />
        </div>
        
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-lg text-gray-400 mb-6">
            Not sure which plan is right for you? Start a free 15-day trial with any plan.
          </p>
          <Button type="accent" size="lg" href="#trial">
            Start Your Free Trial
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;