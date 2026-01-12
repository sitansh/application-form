/**
 * Send application data to CRM webhook
 * @param {Object} applicationData - The application data to send
 * @param {string} crmWebhookUrl - The CRM webhook URL
 * @returns {Promise<Object>} Response from CRM
 */
async function sendToCRM(applicationData, crmWebhookUrl) {
  // Prefer global fetch (Node 18+). If unavailable, fall back to axios if installed.
  if (typeof globalThis.fetch === 'function') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await globalThis.fetch(crmWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
        signal: controller.signal
      });
      clearTimeout(timeout);
      let data = null;
      try { data = await res.json(); } catch (e) { data = null; }
      return {
        success: res.ok,
        status: res.status,
        data
      };
    } catch (err) {
      return {
        success: false,
        status: 0,
        error: err.message
      };
    }
  }

  // Fallback to axios if fetch is not available
  try {
    const axios = require('axios');
    try {
      const response = await axios.post(crmWebhookUrl, applicationData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      return { success: true, status: response.status, data: response.data };
    } catch (error) {
      return { success: false, status: error.response?.status || 0, error: error.message, data: error.response?.data };
    }
  } catch (err) {
    return { success: false, status: 0, error: 'no_fetch_or_axios', message: err.message };
  }
}

module.exports = {
  sendToCRM
};