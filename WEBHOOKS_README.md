# Sandstone Webhooks

Complete webhook system for the Sandstone app, enabling real-time event notifications for user actions, essay submissions, grading completions, and more.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Event Types](#event-types)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Security](#security)
- [Database Schema](#database-schema)
- [Edge Functions](#edge-functions)
- [Troubleshooting](#troubleshooting)

## Overview

The Sandstone webhook system allows external services to receive real-time notifications when events occur within the application. Webhooks are delivered via HTTP POST requests with HMAC-SHA256 signature verification for security.

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Database      │────▶│  Database        │────▶│  Webhook        │
│   Triggers      │     │  Events Queue    │     │  Processor      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                              ┌────────────────────────────┼────────────────────────────┐
                              ▼                            ▼                            ▼
                        ┌─────────┐                  ┌─────────┐                   ┌─────────┐
                        │ Zapier  │                  │ Slack   │                   │ Custom  │
                        │         │                  │         │                   │ Endpoint│
                        └─────────┘                  └─────────┘                   └─────────┘
```

## Features

- **16 Event Types**: User, essay, grading, document, flashcard, and quiz events
- **HMAC-SHA256 Signatures**: Secure payload verification
- **Automatic Retries**: Exponential backoff for failed deliveries
- **Delivery Monitoring**: Track success rates and response times
- **Custom Headers**: Add authentication headers to webhook requests
- **Event Filtering**: Subscribe to specific event types
- **Test Endpoint**: Validate webhook configuration before saving

## Event Types

### User Events

| Event | Description |
|-------|-------------|
| `user.created` | New user registered |
| `user.updated` | User profile updated |
| `user.deleted` | User account deleted |

### Essay Events

| Event | Description |
|-------|-------------|
| `essay.submitted` | New essay submitted |
| `essay.updated` | Essay content updated |
| `essay.deleted` | Essay deleted |

### Grading Events

| Event | Description |
|-------|-------------|
| `grading.started` | Essay grading initiated |
| `grading.completed` | Essay grading completed |
| `grading.failed` | Essay grading failed |

### Document Events

| Event | Description |
|-------|-------------|
| `document.created` | New document created |
| `document.updated` | Document updated |
| `document.deleted` | Document deleted |

### Flashcard Events

| Event | Description |
|-------|-------------|
| `flashcard.deck_created` | New flashcard deck created |
| `flashcard.card_reviewed` | Flashcard reviewed |

### Quiz Events

| Event | Description |
|-------|-------------|
| `quiz.completed` | Quiz completed |
| `quiz.attempt_submitted` | Quiz attempt submitted |

## Getting Started

### 1. Create a Webhook Subscription

```bash
curl -X POST https://your-app.com/api/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Webhook",
    "url": "https://my-service.com/webhook",
    "events": ["essay.submitted", "grading.completed"],
    "description": "Receive essay and grading notifications"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "My Webhook",
    "url": "https://my-service.com/webhook",
    "secret": "whsec_a1b2c3d4e5f6...",
    "events": ["essay.submitted", "grading.completed"],
    "status": "active",
    "message": "Webhook created successfully. Save the secret - it will not be shown again."
  }
}
```

**Important**: Save the `secret` - it will not be shown again!

### 2. Verify Webhook Signatures

Webhooks include an `X-Webhook-Signature` header for verification:

```typescript
import { verifyWebhookSignature } from '@/lib/webhooks';

// In your webhook handler
const signature = req.headers['x-webhook-signature'];
const timestamp = req.headers['x-webhook-timestamp'];
const body = await req.text();

const result = verifyWebhookSignature(body, signature, secret, timestamp);

if (!result.valid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### 3. Handle Webhook Payloads

Example payload for `grading.completed`:

```json
{
  "event": "grading.completed",
  "timestamp": "2025-02-24T10:30:00.000Z",
  "webhookId": "evt_abc123",
  "data": {
    "essay_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-uuid",
    "user_email": "student@example.com",
    "subject": "economics",
    "question": "Explain the causes of inflation...",
    "overall_score": 18.5,
    "grade": "A",
    "feedback": [...],
    "summary": "Excellent analysis with strong evaluation...",
    "improvements": [...],
    "graded_at": "2025-02-24T10:30:00.000Z"
  }
}
```

## API Reference

### Webhook Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhooks` | List your webhooks |
| POST | `/api/webhooks` | Create a new webhook |
| GET | `/api/webhooks/:id` | Get webhook details |
| PATCH | `/api/webhooks/:id` | Update webhook |
| DELETE | `/api/webhooks/:id` | Delete webhook |
| POST | `/api/webhooks/:id/test` | Test webhook endpoint |
| GET | `/api/webhooks/:id/deliveries` | Get delivery history |
| GET | `/api/webhooks/stats` | Get webhook statistics |
| GET | `/api/webhooks/events` | List webhook events |

### Create Webhook

```typescript
POST /api/webhooks
{
  "name": string;           // Required, max 100 chars
  "url": string;            // Required, must be valid URL
  "events": string[];       // Required, at least one event type
  "secret": string;         // Optional, auto-generated if not provided
  "description": string;    // Optional, max 500 chars
  "headers": object;        // Optional, custom headers
  "max_retries": number;    // Optional, default 3, max 10
  "retry_interval": number; // Optional, default 60 seconds
}
```

### Update Webhook

```typescript
PATCH /api/webhooks/:id
{
  "name": string;
  "url": string;
  "events": string[];
  "secret": string;
  "description": string;
  "headers": object;
  "status": "active" | "inactive" | "suspended";
  "max_retries": number;
  "retry_interval": number;
}
```

## Security

### Signature Verification

Webhooks use HMAC-SHA256 signatures in the format:

```
X-Webhook-Signature: v1=<hex_signature>
X-Webhook-Timestamp: <unix_timestamp>
```

The signature is computed as:
```
signature = HMAC-SHA256(secret, timestamp + "." + payload)
```

### Security Best Practices

1. **Always verify signatures** before processing webhooks
2. **Check timestamps** to prevent replay attacks (5-minute window)
3. **Use HTTPS** endpoints in production
4. **Store secrets securely** - never expose them in client-side code
5. **Implement idempotency** - handle duplicate deliveries gracefully

### Example Signature Verification (Node.js)

```typescript
import { createHmac, timingSafeEqual } from 'crypto';

function verifySignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string
): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  
  const sig = signature.replace('v1=', '');
  
  try {
    return timingSafeEqual(
      Buffer.from(sig, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}
```

## Database Schema

### Tables

#### `webhook_subscriptions`
Stores webhook endpoint configurations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Owner user ID |
| `name` | TEXT | Webhook name |
| `url` | TEXT | Endpoint URL |
| `secret` | TEXT | HMAC secret |
| `events` | TEXT[] | Subscribed event types |
| `status` | ENUM | active/inactive/suspended/failed |
| `headers` | JSONB | Custom headers |
| `max_retries` | INTEGER | Max retry attempts |
| `retry_interval` | INTEGER | Base retry interval (seconds) |

#### `webhook_events`
Queue of events to be delivered.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Event ID |
| `event_type` | ENUM | Type of event |
| `payload` | JSONB | Event data |
| `status` | ENUM | pending/delivering/delivered/failed |
| `attempts` | INTEGER | Number of delivery attempts |

#### `webhook_deliveries`
Audit log of all delivery attempts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Delivery ID |
| `event_id` | UUID | Reference to event |
| `subscription_id` | UUID | Reference to subscription |
| `status` | ENUM | Delivery status |
| `http_status` | INTEGER | HTTP response code |
| `duration_ms` | INTEGER | Response time |

## Edge Functions

### Webhook Processor

The `webhook-processor` edge function handles event delivery:

```bash
# Process pending events
curl -X POST https://your-project.supabase.co/functions/v1/webhook-processor \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"

# Retry failed deliveries
curl -X POST "https://your-project.supabase.co/functions/v1/webhook-processor?action=retry" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"

# Clean up old data
curl -X POST "https://your-project.supabase.co/functions/v1/webhook-processor?action=cleanup" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

### Scheduled Processing

Set up a cron job to process webhooks automatically:

```sql
-- Process webhooks every minute
SELECT cron.schedule(
  'process-webhooks',
  '* * * * *',
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/webhook-processor',
    headers:='{"Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
  ) AS request_id;
  $$
);
```

## Troubleshooting

### Common Issues

#### Webhook not receiving events

1. Check webhook status: `GET /api/webhooks/:id`
2. Verify events are in the queue: `GET /api/webhooks/events`
3. Test the endpoint: `POST /api/webhooks/:id/test`
4. Check delivery history: `GET /api/webhooks/:id/deliveries`

#### Signature verification failing

1. Ensure you're using the raw request body (not parsed JSON)
2. Check that timestamp is within 5 minutes
3. Verify the secret matches what was generated

#### High failure rate

1. Check endpoint response times
2. Verify endpoint can handle the request volume
3. Check for rate limiting on your endpoint
4. Review error messages in delivery history

### Debug Commands

```sql
-- View pending events
SELECT * FROM webhook_events 
WHERE status IN ('pending', 'retrying')
ORDER BY created_at DESC;

-- View recent deliveries
SELECT * FROM webhook_deliveries 
WHERE subscription_id = 'your-webhook-id'
ORDER BY started_at DESC
LIMIT 10;

-- Get webhook stats
SELECT * FROM get_webhook_stats(
  'your-webhook-id',
  NOW() - INTERVAL '24 hours',
  NOW()
);

-- Retry failed events
SELECT * FROM retry_failed_webhook_deliveries('your-webhook-id');
```

## Rate Limits

- **Create webhook**: 10 requests per minute
- **Test webhook**: 5 requests per minute
- **List webhooks**: 60 requests per minute
- **Max webhooks per user**: 10

## Support

For issues or questions about webhooks:
1. Check the delivery history in the API
2. Review the error messages
3. Test your endpoint with the test functionality
4. Contact support with your webhook ID and event details
