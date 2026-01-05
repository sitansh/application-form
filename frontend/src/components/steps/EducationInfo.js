import React from 'react';

const EducationInfo = ({ formData, updateFormData, errors }) => {
  return (
    <div>
      <h2>Educational Background</h2>
      
      <div className={`form-group ${errors.highestDegree ? 'error' : ''}`}>
        <label>Highest Degree *</label>
        <select
          value={formData.highestDegree}
          onChange={(e) => updateFormData('highestDegree', e.target.value)}
        >
          <option value="">Select degree</option>
          <option value="High School">High School</option>
          <option value="Associate">Associate Degree</option>
          <option value="Bachelor">Bachelor's Degree</option>
          <option value="Master">Master's Degree</option>
          <option value="Doctorate">Doctorate/PhD</option>
        </select>
        {errors.highestDegree && <div className="error-message">{errors.highestDegree}</div>}
      </div>

      <div className={`form-group ${errors.institution ? 'error' : ''}`}>
        <label>Institution/University *</label>
        <input
          type="text"
          value={formData.institution}
          onChange={(e) => updateFormData('institution', e.target.value)}
          placeholder="Enter institution name"
        />
        {errors.institution && <div className="error-message">{errors.institution}</div>}
      </div>

      <div className="form-row">
        <div className={`form-group ${errors.graduationYear ? 'error' : ''}`}>
          <label>Graduation Year *</label>
          <input
            type="number"
            value={formData.graduationYear}
            onChange={(e) => updateFormData('graduationYear', e.target.value)}
            placeholder="2020"
            min="1950"
            max={new Date().getFullYear() + 10}
          />
          {errors.graduationYear && <div className="error-message">{errors.graduationYear}</div>}
        </div>

        <div className={`form-group ${errors.fieldOfStudy ? 'error' : ''}`}>
          <label>Field of Study *</label>
          <input
            type="text"
            value={formData.fieldOfStudy}
            onChange={(e) => updateFormData('fieldOfStudy', e.target.value)}
            placeholder="e.g., Computer Science"
          />
          {errors.fieldOfStudy && <div className="error-message">{errors.fieldOfStudy}</div>}
        </div>
      </div>
    </div>
  );
};

export default EducationInfo;
