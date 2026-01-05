import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PersonalInfo from './steps/PersonalInfo';
import AddressInfo from './steps/AddressInfo';
import EducationInfo from './steps/EducationInfo';
import WorkExperience from './steps/WorkExperience';
import Review from './steps/Review';
import axios from 'axios';

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Step 2: Address Information
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    
    // Step 3: Education
    highestDegree: '',
    institution: '',
    graduationYear: '',
    fieldOfStudy: '',
    
    // Step 4: Work Experience
    currentEmployer: '',
    jobTitle: '',
    yearsOfExperience: '',
    skills: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const steps = useMemo(() => ([
    { number: 1, label: 'Personal' },
    { number: 2, label: 'Address' },
    { number: 3, label: 'Education' },
    { number: 4, label: 'Experience' },
    { number: 5, label: 'Review' }
  ]), []);

  // Helper: update stepNum and stepName in URL query params while preserving others
  const updateStepInUrl = useCallback((step) => {
    const params = new URLSearchParams(window.location.search);
    if (step == null) {
      params.delete('stepNum');
      params.delete('stepName');
    } else {
      params.set('stepNum', String(step));
      const stepObj = steps.find(s => s.number === Number(step));
      const name = stepObj ? stepObj.label : (step === 6 ? 'thankyou' : `step${step}`);
      params.set('stepName', name);
    }
    const search = params.toString();
    const newUrl = `${window.location.pathname}${search ? `?${search}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [steps]);

  // Initialize from URL or localStorage (draft and step)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlStep = parseInt(params.get('stepNum'), 10);
      const draft = localStorage.getItem('application_draft');
      const savedStep = parseInt(localStorage.getItem('application_step'), 10);

      if (draft) {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
      }

      if (!Number.isNaN(urlStep) && urlStep >=1 && urlStep <= 6) {
        setCurrentStep(urlStep);
      } else if (!Number.isNaN(savedStep) && savedStep >=1 && savedStep <=6) {
        setCurrentStep(savedStep);
        updateStepInUrl(savedStep);
      }
    } catch (err) {
      // ignore initialization errors
      console.warn('Failed to initialize draft/step', err);
    }
  }, [updateStepInUrl]);

  // Persist form draft to localStorage when formData changes
  useEffect(() => {
    try {
      localStorage.setItem('application_draft', JSON.stringify(formData));
    } catch (err) {
      console.warn('Failed to save draft', err);
    }
  }, [formData]);

  // Persist currentStep to localStorage and URL when it changes
  useEffect(() => {
    try {
      localStorage.setItem('application_step', String(currentStep));
      updateStepInUrl(currentStep);
    } catch (err) {
      console.warn('Failed to persist step', err);
    }
  }, [currentStep, updateStepInUrl]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch(step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone is required';
        } else if (!/^\d{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
          newErrors.phone = 'Phone must be 10 digits';
        }
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        break;

      case 2:
        if (!formData.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) {
          newErrors.zipCode = 'ZIP code is required';
        } else if (!/^\d{5,6}$/.test(formData.zipCode)) {
          newErrors.zipCode = 'ZIP code must be 5-6 digits';
        }
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        break;

      case 3:
        if (!formData.highestDegree) newErrors.highestDegree = 'Degree is required';
        if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
        if (!formData.graduationYear) {
          newErrors.graduationYear = 'Graduation year is required';
        } else {
          const year = parseInt(formData.graduationYear);
          const currentYear = new Date().getFullYear();
          if (year < 1950 || year > currentYear + 10) {
            newErrors.graduationYear = `Year must be between 1950 and ${currentYear + 10}`;
          }
        }
        if (!formData.fieldOfStudy.trim()) newErrors.fieldOfStudy = 'Field of study is required';
        break;

      case 4:
        if (!formData.yearsOfExperience) {
          newErrors.yearsOfExperience = 'Years of experience is required';
        } else if (formData.yearsOfExperience < 0 || formData.yearsOfExperience > 50) {
          newErrors.yearsOfExperience = 'Years must be between 0 and 50';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/submit', formData);
      console.log('Application submitted:', response.data);
      // Read applicationId from response (top-level or nested)
      const appId = response.data.applicationId || (response.data.data && response.data.data.applicationId);
      if (appId) {
        // Clear the saved draft and step for this application
        try {
          localStorage.removeItem('application_draft');
          localStorage.removeItem('application_step');
          localStorage.setItem('last_applicationId', appId);
        } catch (err) { /* ignore */ }

        // Redirect to thank you page using query parameters: applicationId, status, page, step
        const qp = `applicationId=${encodeURIComponent(appId)}&status=success&page=thankyou&stepNum=6&stepName=thankyou`;
        window.location.href = `/application?${qp}`;
      } else {
        setSubmitSuccess(true);
        setCurrentStep(6); // Fallback to success screen
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <PersonalInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 2:
        return (
          <AddressInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 3:
        return (
          <EducationInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 4:
        return (
          <WorkExperience
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 5:
        return (
          <Review formData={formData} />
        );
      case 6:
        return (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Application Submitted Successfully!</h2>
            <p>Thank you for your submission. We will review your application and get back to you soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (submitSuccess) {
    return (
      <div className="form-container">
        {renderStep()}
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Application Form</h1>
        <p>Please fill out all the required information</p>
      </div>

      <div className="progress-bar">
        {steps.map(step => (
          <div
            key={step.number}
            className={`progress-step ${
              currentStep === step.number ? 'active' : ''
            } ${currentStep > step.number ? 'completed' : ''}`}
          >
            <div className="progress-circle">{step.number}</div>
            <div className="progress-label">{step.label}</div>
          </div>
        ))}
      </div>

      <div className="form-step">
        {renderStep()}
      </div>

      <div className="form-navigation">
        {currentStep > 1 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={prevStep}
          >
            Previous
          </button>
        )}
        
        {currentStep < 5 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={nextStep}
            style={{ marginLeft: 'auto' }}
          >
            Next
          </button>
        )}
        
        {currentStep === 5 && (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ marginLeft: 'auto' }}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
