import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';

const serviceTypes = [
  { id: 'invoice-management', name: 'Invoice Management' },
  { id: 'quote-system', name: 'Quote System' },
  { id: 'client-portal', name: 'Client Portal' },
  { id: 'appointment-scheduling', name: 'Appointment Scheduling' },
  { id: 'online-payments', name: 'Online Payments' },
  { id: 'business-analytics', name: 'Business Analytics' },
  { id: 'full-package', name: 'Full Business Package' },
  { id: 'other', name: 'Other (Please Specify)' },
];

interface FormData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  serviceType: string;
  otherService: string;
  message: string;
  budget: string;
  agreeToTerms: boolean;
}

const QuoteRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    serviceType: '',
    otherService: '',
    message: '',
    budget: '',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.serviceType) newErrors.serviceType = 'Please select a service type';
    if (formData.serviceType === 'other' && !formData.otherService.trim()) {
      newErrors.otherService = 'Please specify the service';
    }
    if (!formData.message.trim()) newErrors.message = 'Please describe your requirements';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    
    // Clear error when user checks the box
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success('Your quote request has been submitted successfully!');
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] bg-gray-50 py-16">
        <div className="container-custom">
          <div className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-md">
            <div className="mb-6 text-center text-green-500">
              <CheckCircle size={64} className="mx-auto" />
            </div>
            <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
              Thank You!
            </h2>
            <p className="mb-6 text-center text-gray-600">
              Your quote request has been submitted successfully. We'll review your request and get back to you within 24-48 hours.
            </p>
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 py-16">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Request a Quote
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            Fill out the form below and we'll get back to you with a customized solution for your business needs.
          </p>
        </div>

        <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className={`input ${errors.firstName ? 'border-red-500' : ''}`}
                  value={formData.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                  value={formData.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="companyName" className="label">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className="input"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="email" className="label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`input ${errors.email ? 'border-red-500' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="phone" className="label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="serviceType" className="label">
                Service Type *
              </label>
              <select
                id="serviceType"
                name="serviceType"
                className={`input ${errors.serviceType ? 'border-red-500' : ''}`}
                value={formData.serviceType}
                onChange={handleChange}
              >
                <option value="">Select a service</option>
                {serviceTypes.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="mt-1 text-sm text-red-500">{errors.serviceType}</p>
              )}
            </div>

            {formData.serviceType === 'other' && (
              <div>
                <label htmlFor="otherService" className="label">
                  Please Specify *
                </label>
                <input
                  type="text"
                  id="otherService"
                  name="otherService"
                  className={`input ${errors.otherService ? 'border-red-500' : ''}`}
                  value={formData.otherService}
                  onChange={handleChange}
                />
                {errors.otherService && (
                  <p className="mt-1 text-sm text-red-500">{errors.otherService}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="budget" className="label">
                Estimated Budget
              </label>
              <select
                id="budget"
                name="budget"
                className="input"
                value={formData.budget}
                onChange={handleChange}
              >
                <option value="">Select budget range</option>
                <option value="under-1000">Under $1,000</option>
                <option value="1000-5000">$1,000 - $5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000-plus">$10,000+</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="label">
                Project Requirements *
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className={`input ${errors.message ? 'border-red-500' : ''}`}
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe your business needs and any specific requirements..."
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={formData.agreeToTerms}
                  onChange={handleCheckboxChange}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                  I agree to the terms and privacy policy *
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestPage;