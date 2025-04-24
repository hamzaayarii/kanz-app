import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  company: string;
  image: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  quote, 
  author, 
  company, 
  image 
}) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white p-6 shadow-md">
      <div className="relative mb-4">
        <svg 
          className="absolute top-0 left-0 h-8 w-8 -translate-x-3 -translate-y-3 transform text-primary-200" 
          fill="currentColor" 
          viewBox="0 0 32 32" 
          aria-hidden="true"
        >
          <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
        <p className="relative mt-4 text-lg text-gray-700">{quote}</p>
      </div>
      <div className="flex items-center">
        <img 
          src={image} 
          alt={author} 
          className="h-12 w-12 rounded-full object-cover" 
        />
        <div className="ml-4">
          <p className="font-medium text-gray-900">{author}</p>
          <p className="text-sm text-gray-600">{company}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;