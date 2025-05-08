import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, LockKeyhole } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-12 border-t border-white/10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <a href="#" className="text-2xl font-bold gradient-text mb-4 inline-block">
              Kanz
            </a>
            <p className="text-gray-400 mt-4 mb-6">
              The smartest way to manage your accounting. Simplified for teams and businesses of all sizes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12C22 6.48 17.52 2 12 2C6.48 2 2 6.48 2 12C2 16.84 5.44 20.87 10 21.8V15H8V12H10V9.5C10 7.57 11.57 6 13.5 6H16V9H14C13.45 9 13 9.45 13 10V12H16V15H13V21.95C18.05 21.45 22 17.19 22 12Z" fill="currentColor" />
                </svg>
              </a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.46 6C21.69 6.35 20.86 6.58 20 6.69C20.88 6.16 21.56 5.32 21.88 4.31C21.05 4.81 20.13 5.16 19.16 5.36C18.37 4.5 17.26 4 16 4C13.65 4 11.73 5.92 11.73 8.29C11.73 8.63 11.77 8.96 11.84 9.27C8.28 9.09 5.11 7.38 3 4.79C2.63 5.42 2.42 6.16 2.42 6.94C2.42 8.43 3.17 9.75 4.33 10.5C3.62 10.5 2.96 10.3 2.38 10V10.03C2.38 12.11 3.86 13.85 5.82 14.24C5.46 14.34 5.08 14.39 4.69 14.39C4.42 14.39 4.15 14.36 3.89 14.31C4.43 16 6 17.26 7.89 17.29C6.43 18.45 4.58 19.13 2.56 19.13C2.22 19.13 1.88 19.11 1.54 19.07C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79C20.33 8.6 20.33 8.42 20.32 8.23C21.16 7.63 21.88 6.87 22.46 6Z" fill="currentColor" />
                </svg>
              </a>
              <a href="#" className="text-white/50 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H6.5V10H9V17ZM7.75 8.75C6.8 8.75 6 7.95 6 7C6 6.05 6.8 5.25 7.75 5.25C8.7 5.25 9.5 6.05 9.5 7C9.5 7.95 8.7 8.75 7.75 8.75ZM18 17H15.5V13.25C15.5 12.45 14.8 11.75 14 11.75C13.2 11.75 12.5 12.45 12.5 13.25V17H10V10H12.5V11.25C12.95 10.65 13.75 10 14.75 10C16.65 10 18 11.35 18 13.25V17Z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Updates</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Legal</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-gray-400 text-sm">
            © {currentYear} Kanz. All rights reserved.
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <Shield size={14} /> Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <LockKeyhole size={14} /> Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
              <Heart size={14} /> Made with love
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;