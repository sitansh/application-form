import React from 'react';

const AddressInfo = ({ formData, updateFormData, errors }) => {
  return (
    <div>
      <h2>Address Information</h2>
      
      <div className={`form-group ${errors.street ? 'error' : ''}`}>
        <label>Street Address *</label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => updateFormData('street', e.target.value)}
          placeholder="Enter your street address"
        />
        {errors.street && <div className="error-message">{errors.street}</div>}
      </div>

      <div className="form-row">
        <div className={`form-group ${errors.city ? 'error' : ''}`}>
          <label>City *</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            placeholder="Enter your city"
          />
          {errors.city && <div className="error-message">{errors.city}</div>}
        </div>

        <div className={`form-group ${errors.state ? 'error' : ''}`}>
          <label>State/Province *</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => updateFormData('state', e.target.value)}
            placeholder="Enter your state"
          />
          {errors.state && <div className="error-message">{errors.state}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className={`form-group ${errors.zipCode ? 'error' : ''}`}>
          <label>ZIP/Postal Code *</label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => updateFormData('zipCode', e.target.value)}
            placeholder="Enter ZIP code"
          />
          {errors.zipCode && <div className="error-message">{errors.zipCode}</div>}
        </div>

        <div className={`form-group ${errors.country ? 'error' : ''}`}>
          <label>Country *</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => updateFormData('country', e.target.value)}
            placeholder="Enter your country"
          />
          {errors.country && <div className="error-message">{errors.country}</div>}
        </div>
      </div>
    </div>
  );
};

export default AddressInfo;
