import React from 'react';
import './App.css';
import MultiStepForm from './components/MultiStepForm';
import ThankYou from './components/ThankYou';

function App() {
  const path = window.location.pathname;
  const search = window.location.search;

  // Support new URL format: /application?applicationId=XXX&status=success&page=thankyou
  const params = new URLSearchParams(search);
  const isThankYouQuery = params.get('page') === 'thankyou' && params.get('status') === 'success' && params.get('applicationId');

  // Keep legacy support: /application/:id/thankyou
  const isLegacyPath = /^\/application\/[a-zA-Z0-9-]+\/thankyou\/?$/.test(path);

  return (
    <div className="App">
      {isThankYouQuery || isLegacyPath ? <ThankYou /> : <MultiStepForm />}
    </div>
  );
}

export default App;
