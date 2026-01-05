const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/Application');

// POST - Submit application
router.post('/submit', async (req, res) => {
  const endTimer = require('../metrics').submissionDuration.startTimer();
  try {
    const applicationData = req.body;

    req.log.info({ event: 'submit_attempt', sessionId: applicationData.sessionId || null }, 'Application submit attempt');

    // Create new application
    const newApplication = new Application(applicationData);

    // Save to database
    const savedApplication = await newApplication.save();

    // Determine thank-you URL: prefer one provided by the client, otherwise generate a default.
    const base = process.env.FRONTEND_BASE_URL || '';
    const defaultThankYouUrl = `${base}/application?applicationId=${savedApplication.applicationId}&status=success&page=thankyou&stepNum=6&stepName=thankyou`;
    const finalThankYouUrl = (applicationData && applicationData.thankYouUrl) ? applicationData.thankYouUrl : defaultThankYouUrl;

    // Persist the thankYouUrl if not already set
    if (!savedApplication.thankYouUrl || savedApplication.thankYouUrl !== finalThankYouUrl) {
      savedApplication.thankYouUrl = finalThankYouUrl;
      await savedApplication.save();
    }

    // Metrics
    const { submissionCounter } = require('../metrics');
    submissionCounter.inc();
    endTimer();

    req.log.info({ event: 'submit_success', applicationId: savedApplication.applicationId, transactionId: savedApplication.transactionId }, 'Application submitted');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: savedApplication.applicationId,
      transactionId: savedApplication.transactionId,
      sessionId: savedApplication.sessionId,
      thankYouUrl: savedApplication.thankYouUrl,
      data: savedApplication
    });
  } catch (error) {
    const { submissionErrors } = require('../metrics');
    submissionErrors.inc();
    endTimer();
    req.log.error({ err: error }, 'Error submitting application');
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
});

// GET - Get all applications
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// GET - Get single application by ID or applicationId (UUID)
router.get('/applications/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let application = null;

    // Try treating id as a Mongo ObjectId first
    if (mongoose.Types.ObjectId.isValid(id)) {
      application = await Application.findById(id);
    }

    // If not found, try applicationId field (UUID)
    if (!application) {
      application = await Application.findOne({ applicationId: id });
    }

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
});

module.exports = router;
