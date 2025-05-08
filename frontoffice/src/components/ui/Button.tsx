import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = 'primary',
  size = 'md',
  href,
  onClick,
  fullWidth = false,
  className = '',
  disabled = false,
}) => {
  const baseClasses = `btn-${type} ${fullWidth ? 'w-full' : ''}`;
  
  const sizeClasses = {
    sm: 'text-sm px-4 py-2',
    md: 'px-6 py-3',
    lg: 'text-lg px-8 py-4',
  };
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  
  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }
  
  return (
    <button className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;