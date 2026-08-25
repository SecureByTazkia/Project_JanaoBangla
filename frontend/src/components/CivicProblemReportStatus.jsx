import React from 'react';

const CivicProblemReportStatus = ({ status }) => {
  // Ei function status onujayi color ar label return korbe
  const getStatusConfig = (s) => {
    switch(s) {
      case 'submitted':
        return { color: 'bg-secondary', label: 'Pending' };
      case 'under_review':
        return { color: 'bg-warning text-dark', label: 'Under Review' };
      case 'processing':
        return { color: 'bg-info text-dark', label: 'Action Taken' };
      case 'solved':
        return { color: 'bg-success', label: 'Resolved' };
      default:
        return { color: 'bg-secondary', label: 'Pending' };
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
