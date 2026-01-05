import React from 'react';

const PersonalInfo = ({ formData, updateFormData, errors }) => {
  return (
    <div>
      <h2>Personal Information</h2>
      
      <div className="form-row">
        <div className={`form-group ${errors.firstName ? 'error' : ''}`}>
          <label>First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            placeholder="Enter your first name"
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        </div>

        <div className={`form-group ${errors.lastName ? 'error' : ''}`}>
          <label>Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            placeholder="Enter your last name"
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        </div>
      </div>

      <div className={`form-group ${errors.email ? 'error' : ''}`}>
        <label>Email Address *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          placeholder="your.email@example.com"
        />
        {errors.email && <div className="error-message">{errors.email}</div>}
      </div>

      <div className="form-row">
        <div className={`form-group ${errors.phone ? 'error' : ''}`}>
          <label>Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            placeholder="1234567890"
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>

        <div className={`form-group ${errors.dateOfBirth ? 'error' : ''}`}>
          <label>Date of Birth *</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
          />
          {errors.dateOfBirth && <div className="error-message">{errors.dateOfBirth}</div>}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
