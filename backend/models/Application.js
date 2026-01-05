const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Step 1: Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  
  // Step 2: Address Information
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  
  // Step 3: Educational Background
  highestDegree: {
    type: String,
    required: true
  },
  institution: {
    type: String,
    required: true,
    trim: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  fieldOfStudy: {
    type: String,
    required: true,
    trim: true
  },
  
  // Step 4: Work Experience
  currentEmployer: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  yearsOfExperience: {
    type: Number,
    required: true
  },
  skills: {
    type: [String],
    default: []
  },
  
  // Metadata
  applicationId: {
    type: String,
    required: true,
    unique: true,
    default: () => require('crypto').randomUUID()
  },
  // Optional session id assigned by client or generated on server
  sessionId: {
    type: String,
    trim: true,
    index: true,
    default: () => null
  },
  // Transaction id (unique) for this submission
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: () => require('crypto').randomUUID()
  },
  // The URL we will send the user to after successful submission (can be absolute or relative)
  thankYouUrl: {
    type: String,
    trim: true,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
