import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  LineChart, BarChart, PieChart, TrendingUp, Users, Clock, Shield, 
  BarChart2, Globe, Zap
} from 'lucide-react';
import FeatureCard from '../ui/FeatureCard';

const AppPresentation: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  
  return (
    <section id="features" className="section relative" ref={ref}>
      <div className="container">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="heading-lg mb-6">
            Simplify Your <span className="gradient-text">Financial Management</span>
          </h2>
          <p className="subtitle mx-auto">
            Kanz combines powerful accounting features with an intuitive interface to help you focus on growing your business instead of managing spreadsheets.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<LineChart />}
            title="Smart Dashboard"
            description="Get a bird's-eye view of your finances with customizable widgets and real-time data visualization."
            delay={0.1}
            inView={inView}
          />
          
          <FeatureCard 
            icon={<BarChart />}
            title="Automated Reports"
            description="Generate comprehensive financial reports with one click. Export in multiple formats for your accountant."
            delay={0.2}
            inView={inView}
          />
          
          <FeatureCard 
            icon={<Users />}
            title="Multi-User Access"
            description="Collaborate with your team or accountant by assigning custom roles and permissions."
            delay={0.3}
            inView={inView}
          />
          
          <FeatureCard 
            icon={<Clock />}
            title="Time Tracking"
            description="Track billable hours and seamlessly convert them into invoices for your clients."
            delay={0.4}
            inView={inView}
          />
          
          <FeatureCard 
            icon={<TrendingUp />}
            title="Financial Projections"
            description="Forecast your cash flow and business growth with our AI-powered prediction tools."
            delay={0.5}
            inView={inView}
          />
          
          <FeatureCard 
            icon={<Shield />}
            title="Bank-Level Security"
            description="Rest easy knowing your financial data is protected with end-to-end encryption and secure backup."
            delay={0.6}
            inView={inView}
          />
        </div>
        
        <motion.div 
  className="mt-24 relative"
  initial={{ opacity: 0 }}
  animate={inView ? { opacity: 1 } : { opacity: 0 }}
  transition={{ duration: 1, delay: 0.4 }}
>
  <div className="glass rounded-xl overflow-hidden p-1 max-w-5xl mx-auto">
    <div className="relative aspect-[16/9]">
      <video 
        controls
        className="w-full h-full object-cover rounded-lg"
        poster="/assets/images/dashboard.png" // optional
      >
        <source src="/assets/videos/demo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  </div>

  {/* Keep the grid below as is */}
  <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: 0.7 }}
    >

              <div className="w-12 h-12 bg-kanz-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-kanz-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Compliance</h3>
              <p className="text-gray-400">Automatically adapts to tax regulations in over 30 countries.</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <div className="w-12 h-12 bg-kanz-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-kanz-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">Processes thousands of transactions in seconds with real-time updates.</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <div className="w-12 h-12 bg-kanz-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart2 className="text-kanz-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deep Insights</h3>
              <p className="text-gray-400">Uncover valuable business insights with advanced financial analytics.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AppPresentation;