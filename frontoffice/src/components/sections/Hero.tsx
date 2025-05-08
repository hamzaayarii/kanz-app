import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Button from '../ui/Button';

const Hero: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.165, 0.84, 0.44, 1] },
    },
  };
  
  const imageVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [0.165, 0.84, 0.44, 1], delay: 0.2 },
    },
  };
  
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-kanz-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-kanz-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="container relative z-10">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="heading-xl mb-6">
              The <span className="gradient-text">Smartest Way</span> to Manage Your Accounting
            </h1>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <p className="subtitle mx-auto mb-8">
              Kanz simplifies complex financial workflows, automates tedious tasks, and provides real-time insights to help your business thrive in the digital economy.
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button type="primary" size="lg" href="#trial">
              Start Free Trial <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button type="secondary" size="lg" href="#demo">
              <PlayCircle size={18} className="mr-2" /> Log in
            </Button>
          </motion.div>
          
          <motion.div
            variants={imageVariants}
            className="mt-16 md:mt-20 relative"
          >
           <div className="glass rounded-xl overflow-hidden mx-auto max-w-4xl relative" id="trial">
  <img 
    src="/assets/images/dashboard.png" 
    alt="Kanz Dashboard Preview" 
    className="w-full h-auto rounded-xl"
  />
  <div className="absolute inset-0 bg-gradient-to-t from-kanz-dark-900 to-transparent opacity-60"></div>
</div>

            
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <motion.div 
                className="glass rounded-full px-6 py-3 text-sm font-medium text-white/90 flex items-center gap-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                Trusted by 10,000+ businesses worldwide
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;