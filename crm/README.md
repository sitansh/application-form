# CRM (Customer Relationship Management) System

A CRM system to manage and track submitted applications from the application form.

## Features

- **Webhook Integration**: Automatically receives application submissions from the application form backend
- **Application Management**: View, search, and filter applications
- **Status Tracking**: Track application status (new, reviewed, contacted, interviewed, hired, rejected)
- **Search & Filter**: Full-text search and filter by status, date, etc.
- **CRM Fields**: Additional fields like assignedTo, notes, tags for CRM operations

## Project Structure

```
crm/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   └── Application.js
│   ├── routes/
│   │   └── applications.js
│   ├── utils/
│   │   └── webhook.js
│   ├── logs/
│   ├── server.js
│   └── package.json
└── frontend/
    └── (React frontend - to be created)
```

## Setup

### Backend

1. Install dependencies:
```bash
cd crm/backend
npm install
```

2. Create `.env` file:
```bash
cp ../.env.example .env
# Edit .env with your MongoDB URI and configuration
```

3. Start the server:
```bash
npm start
# Or for development:
npm run dev
```

The CRM backend will run on `http://localhost:5001` (default port 5001).

## Integration with Application Form

To integrate the CRM with the application form backend:

1. **In the application form backend `.env`**, add:
```
CRM_WEBHOOK_URL=http://localhost:5001/api/applications/webhook
```

2. **Restart the application form backend** to pick up the new environment variable.

3. Now, whenever an application is submitted, it will automatically be sent to the CRM system.

## API Endpoints

### POST `/api/applications/webhook`
Receive application submissions from the application form backend.

**Request Body**: Application data (same structure as application form)

**Response**:
```json
{
  "success": true,
  "message": "Application saved to CRM",
  "applicationId": "uuid-here"
}
```

### GET `/api/applications`
Get all applications with pagination and filtering.

**Query Parameters**:
- `status` - Filter by status (new, reviewed, contacted, interviewed, hired, rejected)
- `search` - Full-text search
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `sortBy` - Field to sort by (default: submittedAt)
- `sortOrder` - Sort order: asc or desc (default: desc)

**Example**:
```
GET /api/applications?status=new&page=1&limit=20
```

### GET `/api/applications/:id`
Get a single application by ID or applicationId.

### PATCH `/api/applications/:id`
Update an application (for CRM operations like status, notes, etc.).

**Request Body**:
```json
{
  "status": "reviewed",
  "assignedTo": "john@example.com",
  "notes": "Initial review completed",
  "tags": ["priority", "technical"]
}
```

## Application Status Flow

- `new` - Newly submitted application (default)
- `reviewed` - Application has been reviewed
- `contacted` - Candidate has been contacted
- `interviewed` - Interview has been conducted
- `hired` - Candidate has been hired
- `rejected` - Application has been rejected

## Database

The CRM uses MongoDB with the same application schema as the form backend, plus additional CRM-specific fields:

- `status` - Application status
- `assignedTo` - Person assigned to handle this application
- `notes` - Internal notes
- `tags` - Tags for categorization
- `lastContactedAt` - Last contact timestamp

## Development

```bash
# Install dependencies
cd crm/backend
npm install

# Start development server
npm run dev

# Run tests (when available)
npm test
```

## Production

```bash
# Start production server
npm start
```

## Notes

- The CRM can use the same MongoDB database as the application form, or a separate one
- Webhook integration is asynchronous - the application form backend doesn't wait for CRM response
- If CRM is unavailable, the application form will still work (webhook failures are logged but don't block submissions)