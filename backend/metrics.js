const client = require('prom-client');

// Collect default metrics (CPU, memory, nodejs metrics)
client.collectDefaultMetrics({ timeout: 5000 });

// Custom metrics for application submissions
const submissionCounter = new client.Counter({
  name: 'application_submissions_total',
  help: 'Total number of application submissions'
});

const submissionErrors = new client.Counter({
  name: 'application_submission_errors_total',
  help: 'Total number of failed application submissions'
});

const submissionDuration = new client.Histogram({
  name: 'application_submission_duration_seconds',
  help: 'Duration of application submission handlers in seconds',
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

module.exports = {
  client,
  submissionCounter,
  submissionErrors,
  submissionDuration
};
