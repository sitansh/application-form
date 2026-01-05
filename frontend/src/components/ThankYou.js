import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ThankYou = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // First try to read applicationId from query params, then fall back to legacy path
  const params = new URLSearchParams(window.location.search);
  let applicationId = params.get('applicationId');
  const status = params.get('status');

  if (!applicationId) {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    applicationId = pathParts.length >= 3 ? pathParts[1] : null;
  }

  useEffect(() => {
    if (!applicationId) {
      setError('Invalid application URL');
      setLoading(false);
      return;
    }

    const fetchApplication = async () => {
      try {
        const res = await axios.get(`/api/applications/${applicationId}`);
        if (res.data && res.data.success) {
          setApplication(res.data.data);
        } else {
          setError('Application not found');
        }
      } catch (err) {
        setError('Error fetching application');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(application.applicationId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  if (loading) return <div className="thankyou-wrapper">Loading...</div>;
  if (error) return <div className="thankyou-wrapper error-message">{error}</div>;

  return (
    <div className="thankyou-wrapper">
      <div className="thankyou-card">
        <div className="thankyou-header">
          <div className="thankyou-icon">✓</div>
          <h1>Thank you!</h1>
          <p className="muted">Your application has been submitted successfully.</p>
        </div>

        <div className="thankyou-body">
          <div className="meta-row">
            <div>
              <div className="meta-label">Applicant</div>
              <div className="meta-value">{application.firstName} {application.lastName}</div>
            </div>

            <div>
              <div className="meta-label">Submitted</div>
              <div className="meta-value">{new Date(application.submittedAt || application.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="app-id-row">
            <div className="meta-label">Application ID</div>
            <div className="app-id">
              <code>{application.applicationId}</code>
              <button className="btn btn-secondary btn-copy" onClick={copyId}>{copied ? 'Copied' : 'Copy'}</button>
            </div>
          </div>

          <div className="status-row">
            <span className="status-badge">{status || 'thankyou'}</span>
          </div>
        </div>

        <div className="thankyou-actions">
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>Return to Home</button>
          <button className="btn btn-secondary" onClick={() => window.print()}>Print Receipt</button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
