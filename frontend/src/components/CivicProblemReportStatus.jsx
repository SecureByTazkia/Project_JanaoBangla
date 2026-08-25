import React from 'react';

const CivicProblemReportStatus = ({ status }) => {
  // Ei function status onujayi color ar label return korbe
  const getStatusConfig = (s) => {
    switch(s) {
      case 'submitted':
        return { color: 'bg-secondary', label: 'Pending Review' };
      case 'processing':
        return { color: 'bg-primary', label: 'Processing' };
      case 'solved':
        return { color: 'bg-success', label: 'Solved' };
      default:
        return { color: 'bg-secondary', label: 'Pending Review' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`badge rounded-pill ${config.color} px-3 py-2`}>
      {config.label}
    </span>
  );
};

export default CivicProblemReportStatus;
