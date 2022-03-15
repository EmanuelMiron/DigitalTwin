// Import Styles
import './NoResults.scss';

// Import Dependencies
import React from 'react';

// Interfaces
export interface NoResultsProps {
  title: string;
}

// NoResults Component
const NoResults: React.FC<NoResultsProps> = ({
  title,
}) => {
  return (
    <div className="search-no-result">
      <p className="title">
        {title}
      </p>

      <img
        src="/static/images/empty-search.svg"
        alt="No search result image"
        role="presentation"
        aria-hidden={true}
      />
    </div>
  );
};

// Export NoResults Component
export default NoResults;
