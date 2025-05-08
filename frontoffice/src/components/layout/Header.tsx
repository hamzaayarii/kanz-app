import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ['rgba(10, 15, 28, 0)', 'rgba(10, 15, 28, 0.9)']
  );
  
  const headerBackdrop = useTransform(
    scrollY,
    [0, 100],
    ['blur(0px)', 'blur(12px)']
  );
  
  const headerBorder = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.1)']
  );
  
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: headerBg,
        backdropFilter: headerBackdrop,
        borderBottom: `1px solid`,
        borderColor: headerBorder,
      }}
    >
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center">
          <a href="#" className="text-2xl font-bold text-white">
            <span className="gradient-text">Kanz</span>
          </a>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="text-white/80 hover:text-white transition-colors">FAQ</a>
          <Button type="secondary" size="sm" href="#contact">Contact</Button>
          <Button type="primary" size="sm" href="#trial">Start Free Trial</Button>
        </nav>
        
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden glass absolute top-full left-0 right-0 py-4"
        >
          <div className="container flex flex-col space-y-4">
            <a 
              href="#features" 
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#faq" 
              className="text-white/80 hover:text-white transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              FAQ
            </a>
            <div className="flex flex-col space-y-2">
              <Button 
                type="secondary" 
                fullWidth 
                href="#contact"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Button>
              <Button 
                type="primary" 
                fullWidth 
                href="#trial"
                onClick={() => setIsOpen(false)}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;