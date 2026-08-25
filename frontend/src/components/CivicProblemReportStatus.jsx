import React from 'react';

const CivicProblemReportStatus = ({ status }) => {
  // Ei function status onujayi color ar bilingual (English & Bangla) label return korbe
  const getStatusConfig = (s) => {
    switch(s) {
      case 'submitted':
        return { color: 'bg-secondary text-white', label: 'Pending (অভিযোগটি জমা হয়েছে)' };
      case 'under_review':
        return { color: 'bg-warning text-dark', label: 'Under Review (যাচাই চলছে)' };
      case 'processing':
        return { color: 'bg-info text-dark', label: 'Action Taken (ব্যবস্থা নেওয়া হয়েছে)' };
      case 'solved':
        return { color: 'bg-success text-white', label: 'Resolved (নিষ্পত্তি হয়েছে)' };
      default:
        return { color: 'bg-secondary text-white', label: 'Pending (অভিযোগ জমা হয়েছে)' };
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
