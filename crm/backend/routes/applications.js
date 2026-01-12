const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// POST - Receive application from webhook
router.post('/webhook', async (req, res) => {
  try {
    const applicationData = req.body;
    
    req.log.info({
      component: 'crm-backend',
      event: 'webhook_received',
      applicationId: applicationData.applicationId || null
    }, 'Received application from webhook');

    // Check if application already exists
    const existingApp = await Application.findOne({ 
      applicationId: applicationData.applicationId 
    });

    if (existingApp) {
      req.log.info({
        component: 'crm-backend',
        event: 'application_exists',
        applicationId: applicationData.applicationId
      }, 'Application already exists, skipping');
      
      return res.status(200).json({
        success: true,
        message: 'Application already exists',
        applicationId: existingApp.applicationId
      });
    }

    // Create new application with CRM fields
    const newApplication = new Application({
      ...applicationData,
      status: 'new',
      submittedAt: new Date()
    });

    const savedApplication = await newApplication.save();

    req.log.info({
      component: 'crm-backend',
      event: 'application_created',
      applicationId: savedApplication.applicationId,
      status: 201
    }, 'Application saved to CRM');

    res.status(201).json({
      success: true,
      message: 'Application saved to CRM',
      applicationId: savedApplication.applicationId
    });
  } catch (error) {
    req.log.error({
      component: 'crm-backend',
      event: 'webhook_error',
      error: error.message,
      statusCode: 500
    }, 'Error processing webhook');
    
    res.status(500).json({
      success: false,
      message: 'Error processing webhook',
      error: error.message
    });
  }
});

// GET - Get all applications
router.get('/', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50, sortBy = 'submittedAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    req.log.info({
      component: 'crm-backend',
      event: 'applications_fetched',
      count: applications.length,
      total,
      statusCode: 200
    }, 'Fetched applications');

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: applications
    });
  } catch (error) {
    req.log.error({
      component: 'crm-backend',
      event: 'fetch_applications_error',
      error: error.message,
      statusCode: 500
    }, 'Error fetching applications');
    
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// GET - Get single application
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let application = await Application.findOne({
      $or: [
        { applicationId: id },
        { _id: id }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    req.log.info({
      component: 'crm-backend',
      event: 'application_fetched',
      applicationId: application.applicationId,
      statusCode: 200
    }, 'Fetched application');

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    req.log.error({
      component: 'crm-backend',
      event: 'fetch_application_error',
      error: error.message,
      statusCode: 500
    }, 'Error fetching application');
    
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
      error: error.message
    });
  }
});

// PATCH - Update application (CRM operations)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const application = await Application.findOneAndUpdate(
      {
        $or: [
          { applicationId: id },
          { _id: id }
        ]
      },
      {
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    req.log.info({
      component: 'crm-backend',
      event: 'application_updated',
      applicationId: application.applicationId,
      statusCode: 200
    }, 'Application updated');

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    req.log.error({
      component: 'crm-backend',
      event: 'update_application_error',
      error: error.message,
      statusCode: 500
    }, 'Error updating application');
    
    res.status(500).json({
      success: false,
      message: 'Error updating application',
      error: error.message
    });
  }
});

module.exports = router;