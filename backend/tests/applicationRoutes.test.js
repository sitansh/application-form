const request = require('supertest');

// Mock Application model before requiring app
jest.mock('../models/Application');
const Application = require('../models/Application');

const app = require('../server');

beforeEach(() => {
  jest.clearAllMocks();
  app.locals.capturedLogs = [];
});

describe('Application routes logging', () => {
  test('POST /api/submit logs attempt and success with sanitized payload', async () => {
    const payload = { name: 'Alice', ssn: '123-45-6789', email: 'alice@example.com' };

    // Mock constructor returning object with save
    const saved = { ...payload, applicationId: 'app-1', transactionId: 'tx-1', sessionId: 's1', thankYouUrl: undefined, save: jest.fn().mockResolvedValue(true) };
    Application.mockImplementation(() => ({ ...saved, save: jest.fn().mockResolvedValue(saved) }));

    const res = await request(app).post('/api/submit').send(payload).set('Accept', 'application/json');

    expect(res.status).toBe(201);

    const logs = app.locals.capturedLogs;
    // Find submit attempt and success logs
    const attempt = logs.find(l => l.msg === 'Application submit attempt');
    const success = logs.find(l => l.msg === 'Application submitted');

    expect(attempt).toBeDefined();
    expect(attempt.obj.payload.ssn).toBe('[REDACTED]');
    expect(attempt.obj.payload.name).toBe('Alice');

    expect(success).toBeDefined();
    expect(success.obj.status).toBe(201);
  });

  test('GET /api/applications logs attempt and success', async () => {
    const fakeApps = [{ applicationId: 'app-1' }];
    Application.find = jest.fn().mockReturnValue({ sort: () => Promise.resolve(fakeApps) });

    const res = await request(app).get('/api/applications');
    expect(res.status).toBe(200);

    const logs = app.locals.capturedLogs;
    const attempt = logs.find(l => l.msg === 'Fetching applications');
    const success = logs.find(l => l.msg === 'Fetched applications');

    expect(attempt).toBeDefined();
    expect(success).toBeDefined();
    expect(success.obj.count).toBe(1);
  });

  test('GET /api/applications/:id logs not found', async () => {
    Application.findById = jest.fn().mockResolvedValue(null);
    Application.findOne = jest.fn().mockResolvedValue(null);

    const res = await request(app).get('/api/applications/nonexistent');
    expect(res.status).toBe(404);

    const logs = app.locals.capturedLogs;
    const notFound = logs.find(l => l.msg === 'Application not found');
    expect(notFound).toBeDefined();
    expect(notFound.obj.status).toBe(404);
  });
});
