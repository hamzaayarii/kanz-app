import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Transition } from '@headlessui/react';
import KanzLogo from '../assets/kanz.png';
const features = [
  {
    name: 'Gestion des factures',
    description: 'Créez et gérez vos factures facilement',
    href: '/services#invoicing',
  },
  {
    name: 'Devis en ligne',
    description: 'Générez des devis professionnels',
    href: '/services#quotes',
  },
  {
    name: 'Espace client',
    description: 'Accédez à votre espace personnel',
    href: '/services#client-portal',
  },
  {
    name: 'Paiements sécurisés',
    description: 'Effectuez vos paiements en toute sécurité',
    href: '/services#payments',
  },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsFeaturesOpen(false);
  }, [location.pathname]);

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container-custom">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
        <Link to="/" className="flex items-center">
        <img src={KanzLogo} alt="KanZ Logo"  className="h-16 w-16 mr-2"  />

        
          <span className="text-2xl font-bold text-primary-600">KanZ</span>
        </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === '/' 
                    ? 'text-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Home
              </Link>

              {/* Features Dropdown */}
              <div className="relative">
                <button
                  className={`group inline-flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                    isFeaturesOpen ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`}
                  onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                >
                  Fonctionnalités
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform ${
                      isFeaturesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <Transition
                  show={isFeaturesOpen}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <div className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 transform px-2">
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                        {features.map((feature) => (
                          <Link
                            key={feature.name}
                            to={feature.href}
                            className="-m-3 flex items-start rounded-lg p-3 transition duration-150 ease-in-out hover:bg-gray-50"
                          >
                            <div className="ml-4">
                              <p className="text-base font-medium text-gray-900">
                                {feature.name}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {feature.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>
              <Link
                to="/prices"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === '/prices' 
                    ? 'text-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Tarifs
              </Link>
              <Link
                to="/services"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === '/services' 
                    ? 'text-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Services
              </Link>
              <Link
                to="/quote-request"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === '/quote-request' 
                    ? 'text-primary-600' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Request Quote
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
              ) : (
                <Link  to="http://localhost:3000/auth/login" className="btn-primary">
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <Transition
        show={isMenuOpen}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="md:hidden">
          <div className="space-y-1 bg-white px-2 pb-3 pt-2 shadow-lg">
            <Link
              to="/"
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                location.pathname === '/' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
              }`}
            >
              Home
            </Link>

            {/* Mobile Features Menu */}
            <div className="space-y-1 px-3 py-2">
              <div className="text-sm font-medium text-gray-900">Fonctionnalités</div>
              {features.map((feature) => (
                <Link
                  key={feature.name}
                  to={feature.href}
                  className="block rounded-md py-2 pl-4 text-sm text-gray-600 hover:text-primary-600"
                >
                  {feature.name}
                </Link>
              ))}
            </div>

            <Link
              to="/services"
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                location.pathname === '/services' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
              }`}
            >
              Services
            </Link>
            <Link
              to="/quote-request"
              className={`block rounded-md px-3 py-2 text-base font-medium ${
                location.pathname === '/quote-request' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
              }`}
            >
              Request Quote
            </Link>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="block rounded-md bg-primary-600 px-3 py-2 text-base font-medium text-white hover:bg-primary-700"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="http://localhost:3000/auth/login"
                className="block rounded-md bg-primary-600 px-3 py-2 text-base font-medium text-white hover:bg-primary-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </Transition>
    </nav>
  );
};

export default Navbar;