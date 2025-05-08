import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

const CTA: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  return (
    <section id="contact" className="section bg-gradient-to-br from-kanz-dark-900 to-kanz-dark-950" ref={ref}>
      <div className="container">
        <div className="glass rounded-xl overflow-hidden">
          <div className="p-8 md:p-16 relative">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-kanz-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-kanz-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="heading-lg mb-6">
                  Ready to take control of your <span className="gradient-text">finances</span>?
                </h2>
                <p className="subtitle mb-8">
                  Join thousands of businesses that use Kanz to simplify their accounting and focus on what matters most—growing their business.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button type="primary" size="lg" href="#trial">
                    Start Free Trial <ArrowRight size={18} className="ml-2" />
                  </Button>
                  <Button type="secondary" size="lg" href="#login">
                    Log In
                  </Button>
                </div>
                
                <p className="text-sm text-gray-400 mt-4">
                  No credit card required. Cancel anytime.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="rounded-xl overflow-hidden">
                  <img 
                    src="https://images.pexels.com/photos/7821532/pexels-photo-7821532.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                    alt="Kanz in action" 
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </motion.div>
            </div>
            
            <motion.div
              className="mt-16 pt-8 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">15k+</div>
                  <div className="text-gray-400">Active Users</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">$100M+</div>
                  <div className="text-gray-400">Revenue Managed</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">4.9/5</div>
                  <div className="text-gray-400">Customer Rating</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text mb-2">30+</div>
                  <div className="text-gray-400">Integrations</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;