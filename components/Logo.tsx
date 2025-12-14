import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M50 15L90 90L50 70L10 90L50 15Z" 
      fill="#EF4444" 
      stroke="#EF4444" 
      strokeWidth="2" 
      strokeLinejoin="round" 
    />
  </svg>
);