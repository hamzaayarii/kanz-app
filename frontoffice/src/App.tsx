import React from 'react';
import { motion } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import AppPresentation from './components/sections/AppPresentation';
import Pricing from './components/sections/Pricing';
import FAQ from './components/sections/FAQ';
import CTA from './components/sections/CTA';

function App() {
  return (
    <div className="relative">
      {/* Background elements */}
      <div className="blur-dot w-[500px] h-[500px] bg-kanz-500 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="blur-dot w-[500px] h-[500px] bg-kanz-accent-500 bottom-0 right-0 translate-x-1/2 translate-y-1/2"></div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
        
        <main>
          <Hero />
          <AppPresentation />
          <Pricing />
          <FAQ />
          <CTA />
        </main>
        
        <Footer />
      </motion.div>
    </div>
  );
}

export default App;