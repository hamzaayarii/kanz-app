import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  ClipboardList, 
  Users, 
  Calendar, 
  CreditCard, 
  BarChart,
  MessageSquare,
  Shield,
  Clock
} from 'lucide-react';
import ServiceCard from '../components/ServiceCard';

const services = [
  {
    title: 'Invoice Management',
    description: 'Create, send, and track professional invoices. Get real-time updates when clients view or pay invoices.',
    icon: FileText,
    features: [
      'Automated payment reminders',
      'Multiple payment options',
      'Invoice tracking and history',
      'Customizable invoice templates',
    ],
  },
  {
    title: 'Quote Requests',
    description: 'Create detailed quotes that can be easily converted to invoices once approved by your clients.',
    icon: ClipboardList,
    features: [
      'Streamlined approval process',
      'Conversion to invoices with one click',
      'PDF download option',
      'Email notifications for status updates',
    ],
  },
  {
    title: 'Client Portal',
    description: 'Provide clients with a secure area to access all their documents, invoices, and communication history.',
    icon: Users,
    features: [
      'Secure login system',
      'Document storage and sharing',
      'Project collaboration tools',
      'Client profile management',
    ],
  },
  {
    title: 'Appointment Scheduling',
    description: 'Allow clients to book appointments and consultations directly through your business portal.',
    icon: Calendar,
    features: [
      'Integration with your calendar',
      'Automated reminders',
      'Booking management system',
      'Availability customization',
    ],
  },
  {
    title: 'Online Payments',
    description: 'Accept online payments securely and track all transactions in one centralized system.',
    icon: CreditCard,
    features: [
      'Multiple payment methods',
      'Secure payment processing',
      'Automatic payment receipts',
      'Payment history tracking',
    ],
  },
  {
    title: 'Business Analytics',
    description: 'Gain insights into your business performance with comprehensive reporting and analytics tools.',
    icon: BarChart,
    features: [
      'Financial performance dashboards',
      'Client engagement metrics',
      'Revenue forecasting',
      'Customizable reports',
    ],
  },
  {
    title: 'Messaging System',
    description: 'Communicate directly with clients through our integrated messaging system, keeping all project discussions in one place.',
    icon: MessageSquare,
    features: [
      'Threaded conversations',
      'File attachments',
      'Notification alerts',
      'Message history',
    ],
  },
  {
    title: 'Data Security',
    description: 'Keep your client data secure with our enterprise-grade security features and regular backups.',
    icon: Shield,
    features: [
      'End-to-end encryption',
      'Regular data backups',
      'Access controls',
      'GDPR compliance',
    ],
  },
  {
    title: 'Time Tracking',
    description: 'Track time spent on client projects for accurate billing and project management.',
    icon: Clock,
    features: [
      'Billable hours tracking',
      'Project time allocation',
      'Automated time reports',
      'Integration with invoicing',
    ],
  },
];

const ServicesPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
              Our Services
            </h1>
            <p className="mb-8 text-xl text-gray-600">
              Explore the range of tools and services available to help manage your business efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container-custom">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div key={index} className="card flex flex-col">
                <div className="mb-4 inline-flex rounded-full bg-primary-100 p-3 text-primary-600">
                  <service.icon size={24} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">{service.title}</h3>
                <p className="mb-4 text-gray-600">{service.description}</p>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Key Features:</h4>
                <ul className="mb-4 space-y-2 text-sm text-gray-600">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg
                        className="mr-2 h-4 w-4 flex-shrink-0 text-primary-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-4">
                  <Link 
                    to="/quote-request" 
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Learn more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mb-12 text-lg text-gray-600">
              Getting started with our platform is simple and straightforward.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-between">
                {[
                  { step: 1, title: 'Sign Up' },
                  { step: 2, title: 'Set Up Your Profile' },
                  { step: 3, title: 'Invite Clients' },
                  { step: 4, title: 'Start Managing' },
                ].map((step) => (
                  <div key={step.step} className="text-center">
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white">
                        {step.step}
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">For Business Owners</h3>
                <p className="mb-4 text-gray-600">
                  Our platform streamlines your business operations, from creating quotes and invoices to 
                  managing client relationships and tracking payments.
                </p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Create professional quotes and invoices in minutes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Track payments and send automatic reminders</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Get insights with detailed business analytics</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Centralize client communications and document sharing</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-xl font-semibold text-gray-900">For Clients</h3>
                <p className="mb-4 text-gray-600">
                  Your clients get a dedicated portal where they can access quotes, invoices, and 
                  communicate with your team - all in one place.
                </p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure login to view quotes and invoices</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Pay invoices online with secure payment processing</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Download and access all documents in one place</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="mr-2 h-5 w-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Communicate directly within the platform</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

     

      {/* CTA Section */}
      <section className="bg-primary-700 py-16 text-white">
        <div className="container-custom">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg">
              Request a quote today and see how our platform can transform your business operations.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/quote-request"
                className="btn bg-white px-6 py-3 text-base font-medium text-primary-600 hover:bg-gray-100"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;