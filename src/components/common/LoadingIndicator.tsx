import React from 'react';
import './LoadingIndicator.css';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="loading-indicator-overlay">
      <div className="loading-indicator-container">
        <svg
          className="loading-indicator-svg"
          viewBox="0 0 50 50"
        >
          <circle
            className="loading-indicator-path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
          ></circle>
        </svg>
      </div>
    </div>
  );
};

export default LoadingIndicator;
