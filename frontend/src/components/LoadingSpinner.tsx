import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#2563eb' 
}) => {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div 
        className="loading-spinner" 
        style={{ borderColor: `${color} transparent ${color} transparent` }}
      />
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default LoadingSpinner; 