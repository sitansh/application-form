import React from 'react';

const Review = ({ formData }) => {
  return (
    <div>
      <h2>Review Your Application</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Please review all the information before submitting your application.
      </p>

      <div className="review-section">
        <h3>Personal Information</h3>
        <div className="review-item">
          <span className="review-label">Name:</span>
          <span className="review-value">{formData.firstName} {formData.lastName}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Email:</span>
          <span className="review-value">{formData.email}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Phone:</span>
          <span className="review-value">{formData.phone}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Date of Birth:</span>
          <span className="review-value">{formData.dateOfBirth}</span>
        </div>
      </div>

      <div className="review-section">
        <h3>Address Information</h3>
        <div className="review-item">
          <span className="review-label">Street:</span>
          <span className="review-value">{formData.street}</span>
        </div>
        <div className="review-item">
          <span className="review-label">City:</span>
          <span className="review-value">{formData.city}</span>
        </div>
        <div className="review-item">
          <span className="review-label">State:</span>
          <span className="review-value">{formData.state}</span>
        </div>
        <div className="review-item">
          <span className="review-label">ZIP Code:</span>
          <span className="review-value">{formData.zipCode}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Country:</span>
          <span className="review-value">{formData.country}</span>
        </div>
      </div>

      <div className="review-section">
        <h3>Educational Background</h3>
        <div className="review-item">
          <span className="review-label">Highest Degree:</span>
          <span className="review-value">{formData.highestDegree}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Institution:</span>
          <span className="review-value">{formData.institution}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Graduation Year:</span>
          <span className="review-value">{formData.graduationYear}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Field of Study:</span>
          <span className="review-value">{formData.fieldOfStudy}</span>
        </div>
      </div>

      <div className="review-section">
        <h3>Work Experience</h3>
        {formData.currentEmployer && (
          <div className="review-item">
            <span className="review-label">Current Employer:</span>
            <span className="review-value">{formData.currentEmployer}</span>
          </div>
        )}
        {formData.jobTitle && (
          <div className="review-item">
            <span className="review-label">Job Title:</span>
            <span className="review-value">{formData.jobTitle}</span>
          </div>
        )}
        <div className="review-item">
          <span className="review-label">Years of Experience:</span>
          <span className="review-value">{formData.yearsOfExperience}</span>
        </div>
        {formData.skills.length > 0 && (
          <div className="review-item">
            <span className="review-label">Skills:</span>
            <span className="review-value">{formData.skills.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Review;
