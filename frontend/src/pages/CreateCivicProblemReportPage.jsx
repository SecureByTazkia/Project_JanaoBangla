import React from 'react';
import CreateCivicProblemReportForm from '../components/CreateCivicProblemReportForm';

const CreateCivicProblemReportPage = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="text-center mb-4">
            <h1 className="fw-bold text-primary-dark">Report a Problem</h1>
            <p className="text-muted">Help us build a better Bangladesh by reporting civic issues around you.</p>
          </div>
          <CreateCivicProblemReportForm />
        </div>
      </div>
    </div>
  );
};

export default CreateCivicProblemReportPage;
