import React from 'react';

interface ClientCardProps {
  logo: string;
  name: string;
  alt?: string;
}

const ClientCard: React.FC<ClientCardProps> = ({ logo, name, alt }) => {
  return (
    <div className="rounded-md bg-white p-4 shadow-sm transition-all hover:shadow-md flex items-center justify-center h-24">
      <img 
        src={logo} 
        alt={alt || `${name} logo`} 
        className="max-h-12 max-w-full grayscale transition-all hover:grayscale-0" 
      />
    </div>
  );
};

export default ClientCard;