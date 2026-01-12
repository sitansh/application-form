const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/Application');
const { sanitizePayload, getDatabaseStatus } = require('../utils/logging');

// POST - Submit application
router.post('/submit', async (req, res) => {
  const endTimer = require('../metrics').submissionDuration.startTimer();
  let applicationData = req.body;
  try {
    req.log.info({ 
      component: 'backend',
      event: 'submit_attempt', 
      sessionId: applicationData.sessionId || null, 
      payload: sanitizePayload(applicationData),
      database: getDatabaseStatus()
    }, 'Application submit attempt');

    // Create new application
    const newApplication = new Application(applicationData);

    // Save to database
    const dbStartTime = Date.now();
    const savedApplication = await newApplication.save();
    const dbDuration = Date.now() - dbStartTime;

    req.log.info({
      component: 'backend',
      event: 'database_save_success',
      applicationId: savedApplication.applicationId,
      database: getDatabaseStatus(),
      dbOperation: 'save',
      dbDuration_ms: dbDuration
    }, 'Application saved to database');

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

    // Send to CRM webhook (async, don't wait for response)
    const crmWebhookUrl = process.env.CRM_WEBHOOK_URL;
    if (crmWebhookUrl) {
      const { sendToCRM } = require('../utils/webhook');
      sendToCRM(savedApplication.toObject(), crmWebhookUrl)
        .then(result => {
          if (result.success) {
            req.log.info({
              component: 'backend',
              event: 'crm_webhook_success',
              applicationId: savedApplication.applicationId
            }, 'Application sent to CRM successfully');
          } else {
            req.log.warn({
              component: 'backend',
              event: 'crm_webhook_failed',
              applicationId: savedApplication.applicationId,
              error: result.error
            }, 'Failed to send application to CRM');
          }
        })
        .catch(err => {
          req.log.error({
            component: 'backend',
            event: 'crm_webhook_error',
            applicationId: savedApplication.applicationId,
            error: err.message
          }, 'Error sending application to CRM');
        });
    }

    req.log.info({ 
      component: 'backend',
      event: 'submit_success', 
      applicationId: savedApplication.applicationId, 
      transactionId: savedApplication.transactionId, 
      statusCode: 201,
      status: 'success',
      applicationStatus: 'submitted',
      database: getDatabaseStatus()
    }, 'Application submitted successfully');

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
    req.log.error({ 
      component: 'backend',
      event: 'submit_error',
      err: error, 
      errorMessage: error.message,
      payload: sanitizePayload(applicationData), 
      statusCode: 500,
      status: 'error',
      applicationStatus: 'failed',
      database: getDatabaseStatus()
    }, 'Error submitting application');
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
    req.log.info({ 
      component: 'backend',
      event: 'fetch_applications_attempt', 
      query: sanitizePayload(req.query),
      database: getDatabaseStatus()
    }, 'Fetching applications');

    const dbStartTime = Date.now();
    const applications = await Application.find().sort({ submittedAt: -1 });
    const dbDuration = Date.now() - dbStartTime;
    
    req.log.info({ 
      component: 'backend',
      event: 'fetch_applications_success', 
      count: applications.length, 
      statusCode: 200,
      status: 'success',
      database: getDatabaseStatus(),
      dbOperation: 'find',
      dbDuration_ms: dbDuration
    }, 'Fetched applications');

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    req.log.error({ 
      component: 'backend',
      event: 'fetch_applications_error',
      err: error, 
      errorMessage: error.message,
      statusCode: 500,
      status: 'error',
      database: getDatabaseStatus()
    }, 'Error fetching applications');
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
    req.log.info({ 
      component: 'backend',
      event: 'fetch_application_attempt', 
      id,
      database: getDatabaseStatus()
    }, 'Fetching single application');

    let application = null;
    const dbStartTime = Date.now();

    // Try treating id as a Mongo ObjectId first
    if (mongoose.Types.ObjectId.isValid(id)) {
      application = await Application.findById(id);
    }

    // If not found, try applicationId field (UUID)
    if (!application) {
      application = await Application.findOne({ applicationId: id });
    }
    const dbDuration = Date.now() - dbStartTime;

    if (!application) {
      req.log.info({ 
        component: 'backend',
        event: 'fetch_application_not_found', 
        id, 
        statusCode: 404,
        status: 'not_found',
        applicationStatus: 'not_found',
        database: getDatabaseStatus(),
        dbDuration_ms: dbDuration
      }, 'Application not found');
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    req.log.info({ 
      component: 'backend',
      event: 'fetch_application_success', 
      applicationId: application.applicationId || null, 
      statusCode: 200,
      status: 'success',
      applicationStatus: 'found',
      database: getDatabaseStatus(),
      dbOperation: 'findOne',
      dbDuration_ms: dbDuration
    }, 'Fetched single application');

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    req.log.error({ 
      component: 'backend',
      event: 'fetch_application_error',
      err: error, 
      errorMessage: error.message,
      statusCode: 500,
      status: 'error',
      database: getDatabaseStatus()
    }, 'Error fetching application');
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
});

module.exports = router;
