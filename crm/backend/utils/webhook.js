const axios = require('axios');

/**
 * Send application data to CRM webhook
 * @param {Object} applicationData - The application data to send
 * @param {string} crmWebhookUrl - The CRM webhook URL
 * @returns {Promise<Object>} Response from CRM
 */
async function sendToCRM(applicationData, crmWebhookUrl) {
  try {
    const response = await axios.post(crmWebhookUrl, applicationData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout
    });
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      error: error.message,
      data: error.response?.data
    };
  }
}

module.exports = {
  sendToCRM
};