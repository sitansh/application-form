const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Application ID from the original form
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
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
    lowercase: true,
    index: true
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
  
  // CRM-specific fields
  status: {
    type: String,
    enum: ['new', 'reviewed', 'contacted', 'interviewed', 'hired', 'rejected'],
    default: 'new',
    index: true
  },
  assignedTo: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    default: []
  },
  
  // Metadata
  sessionId: {
    type: String,
    trim: true,
    index: true
  },
  thankYouUrl: {
    type: String,
    trim: true
  },
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastContactedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for search
applicationSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });
applicationSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);