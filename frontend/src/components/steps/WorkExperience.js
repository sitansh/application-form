import React, { useState } from 'react';

const WorkExperience = ({ formData, updateFormData, errors }) => {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      updateFormData('skills', [...formData.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    updateFormData('skills', formData.skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div>
      <h2>Work Experience</h2>
      
      <div className="form-row">
        <div className={`form-group ${errors.currentEmployer ? 'error' : ''}`}>
          <label>Current/Most Recent Employer</label>
          <input
            type="text"
            value={formData.currentEmployer}
            onChange={(e) => updateFormData('currentEmployer', e.target.value)}
            placeholder="Company name"
          />
          {errors.currentEmployer && <div className="error-message">{errors.currentEmployer}</div>}
        </div>

        <div className={`form-group ${errors.jobTitle ? 'error' : ''}`}>
          <label>Job Title</label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => updateFormData('jobTitle', e.target.value)}
            placeholder="Your position"
          />
          {errors.jobTitle && <div className="error-message">{errors.jobTitle}</div>}
        </div>
      </div>

      <div className={`form-group ${errors.yearsOfExperience ? 'error' : ''}`}>
        <label>Years of Experience *</label>
        <input
          type="number"
          value={formData.yearsOfExperience}
          onChange={(e) => updateFormData('yearsOfExperience', e.target.value)}
          placeholder="0"
          min="0"
          max="50"
        />
        {errors.yearsOfExperience && <div className="error-message">{errors.yearsOfExperience}</div>}
      </div>

      <div className="form-group">
        <label>Skills</label>
        <div className="skills-input">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a skill and press Add"
          />
          <button
            type="button"
            className="btn-add-skill"
            onClick={addSkill}
          >
            Add Skill
          </button>
        </div>
        
        {formData.skills.length > 0 && (
          <div className="skills-list">
            {formData.skills.map((skill, index) => (
              <div key={index} className="skill-tag">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  aria-label="Remove skill"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkExperience;
