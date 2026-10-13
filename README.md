# Laneful Node.js/TypeScript SDK

A TypeScript/JavaScript client for the Laneful email API

## Prerequisites

- Node.js 16+

## Installation

```bash
npm install laneful
```

## Quick Start

```typescript
import { LanefulClient, Email } from 'laneful';

// Initialize the client
const client = new LanefulClient(
  'https://custom-endpoint.send.laneful.net',
  'your-auth-token'
);

// Create an email
const email: Email = {
  from: { email: 'noreply@yourdomain.com', name: 'Your App Name' },
  to: [{ email: 'user@example.com', name: 'User Name' }],
  subject: 'Welcome to Our Service',
  textContent: 'Welcome to our service!'
};

// Send the email
try {
  const response = await client.sendEmail(email);
  console.log('Email sent successfully!', response);
} catch (error) {
  console.error('Failed to send email:', error);
}
```

## API Reference

### LanefulClient

```typescript
// Initialize client
const client = new LanefulClient(baseUrl, authToken, options?)

// Send single email (optional mail settings)
await client.sendEmail(email: Email, settings?: MailSettings): Promise<SendEmailResponse>

// Send bulk emails
await client.sendEmails(emails: Email[], settings?: MailSettings): Promise<SendEmailResponse>
```

### Core Interfaces

```typescript
interface Email {
  from: Address;
  subject: string;
  to?: Address[];
  cc?: Address[];
  bcc?: Address[];
  textContent?: string;
  htmlContent?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  attachments?: Attachment[];
  headers?: Record<string, string>;
  replyTo?: Address;
  sendTime?: number;        // Unix timestamp for scheduling
  webhookData?: Record<string, string>;
  tag?: string;
  tracking?: TrackingSettings;
  fromHeader?: Address;     // Visible From header
}

interface Address {
  email: string;
  name?: string;
}

interface Attachment {
  contentType: string;
  fileName?: string;
  content?: string;         // Base64 encoded
}

interface TrackingSettings {
  opens?: boolean;          // Track email opens (default: true)
  clicks?: boolean;         // Track link clicks (default: true)
  unsubscribes?: boolean;   // Track unsubscribes (default: true)
  unsubscribeGroupId?: number;   // Optional unsubscribe group ID
  unsubscribeGroupName?: string; // Ignored if unsubscribeGroupId is set
}

interface MailSettings {
  idempotencyKey?: string;     // Duplicate send protection, 1 to 36 bytes
  sandboxMode?: boolean;       // Do not persist or send
  returnMessageIds?: boolean;  // Include message_ids in the response
}

interface SendEmailResponse {
  status: string;
  messageIds?: string[];
  messageId?: string;
}
```

### Mail settings

```typescript
const response = await client.sendEmail(email, {
  sandboxMode: true,
  returnMessageIds: true,
});
console.log(response.status, response.messageIds);
```

### Retries and duplicate send protection

The client retries every request up to 3 more times by default: on timeouts (default 30 seconds), connection errors, 429 and 5xx responses other than 501, with exponential backoff starting at 1 second. Configure it with the `retry` option (`maxRetries`, `baseDelay`, `maxDelay`, `backoffMultiplier`, `jitter`).

Every `sendEmail` and `sendEmails` call carries an idempotency key, and retries reuse it, so a send that timed out after Laneful accepted it is not delivered twice. The client generates a random key per call. Pass your own key to also protect against your application sending the same request again, for example after a restart:

```typescript
await client.sendEmail(email, { idempotencyKey: `order-${order.id}` });
```

How Laneful handles the key:

- It must be 1 to 36 bytes; the client throws `LanefulValidationError` otherwise.
- A key is remembered per organization for one hour. A repeated request with the same key gets status `accepted` with no message IDs, and nothing is sent, even if the emails differ, so use a new key for every distinct send.
- If a request fails, the key is released and a retry with the same key is processed normally.
- Sandbox mode requests are not deduplicated.

## Webhooks

```typescript
import { WebhookHandler, WebhookEventType } from 'laneful';

const webhookHandler = new WebhookHandler('your-webhook-secret');

// Register event handlers
webhookHandler.on(WebhookEventType.DELIVERY)((event) => {
    console.log(`Email delivered: ${event.message_id}`);
    console.log(`Recipient: ${event.email}`);
});

webhookHandler.on(WebhookEventType.OPEN)((event) => {
    console.log(`Email opened: ${event.message_id}`);
    // Access open-specific fields
    if (event.event === WebhookEventType.OPEN) {
        console.log(`Client IP: ${event.client_ip}`);
        console.log(`Device: ${event.client_device}`);
    }
});

webhookHandler.on(WebhookEventType.CLICK)((event) => {
    console.log(`Link clicked: ${event.url}`);
    // Access click-specific fields
    if (event.event === WebhookEventType.CLICK) {
        console.log(`Referer: ${event.referer}`);
        console.log(`Client OS: ${event.client_os}`);
    }
});

// Verify and process webhooks (supports both single events and batch mode)
app.post('/webhook', (req, res) => {
    const signature = req.headers['x-webhook-signature'];

    if (!webhookHandler.verifySignature(JSON.stringify(req.body), signature)) {
        return res.status(401).send('Invalid signature');
    }

    webhookHandler.processWebhook(req.body);
    res.status(200).send('OK');
});
```

### Event Types

**Available Events:** `request`, `delivery`, `open`, `click`, `drop`, `spam_complaint`, `unsubscribe`, `bounce`

Temporary delivery failures (deferrals) are sent as `bounce` events with `is_hard: false` while Laneful keeps retrying for up to 72 hours. A permanent failure is a `bounce` with `is_hard: true`, and when retries run out after 72 hours the final event is a `bounce` with `is_hard: true` (a `drop` on relay lanes).

### Event Fields

Every event has `id`, `event`, `email`, `message_id`, `lane_id`, `tag`, `timestamp` and `metadata` (the `webhookData` sent with the email). `id` is unique per event and stays the same when Laneful delivers the event again on retry or in a batch, so use it to skip events you have already processed.

### Event-Specific Fields

- **request**: `mx_host`
- **delivery**: `mx_host`, `relay` (true when delivered through a relay lane)
- **open**: `referer`, `client_name`, `client_os`, `client_ip`, `client_device`, `is_machine`
- **click**: `url`, `referer`, `client_name`, `client_os`, `client_ip`, `client_device`, `is_machine`
- **drop**: `reason`, `mx_host`
- **spam_complaint**: `feedback_type`, `feedback_type_text`, `received_unix_timestamp`, `mx_host`
- **unsubscribe**: `unsubscribe_group_id` (number), `mx_host` (mailto unsubscribes)
- **bounce**: `code`, `extended_code`, `text`, `is_hard`, `deliverability_issue`, `classification`, `mx_host`

`is_machine` marks opens and clicks that look automated, such as security scanners. Events also keep any field this SDK doesn't type yet, so new fields Laneful adds reach your handlers without an SDK update.

### Batch Mode Support

Webhooks support batch mode where multiple events are sent as an array:

```typescript
// Single event
{
  "event": "delivery",
  "email": "user@example.com",
  // ... other fields
}

// Batch mode (array of events)
[
  {
    "event": "delivery",
    "email": "user@example.com",
    // ... other fields
  },
  {
    "event": "open", 
    "email": "user@example.com",
    // ... other fields
  }
]
```

## Examples

```typescript
// Template email
await client.sendEmail({
  from: { email: 'noreply@yourdomain.com', name: 'Your App' },
  to: [{ email: 'user@example.com', name: 'John Smith' }],
  subject: 'Welcome to Our Service',
  templateId: '1234',
  templateData: {
    user_name: 'John Smith',
    company_name: 'Acme Corp',
    activation_link: 'https://app.example.com/activate/abc123',
    support_email: 'support@yourdomain.com'
  }
});

// Email with attachment
await client.sendEmail({
  from: { email: 'sender@yourdomain.com' },
  to: [{ email: 'recipient@example.com' }],
  subject: 'Document',
  textContent: 'Please find attached.',
  attachments: [{
    contentType: 'application/pdf',
    fileName: 'document.pdf',
    content: 'base64-encoded-content'
  }]
});

// Email with tracking settings
await client.sendEmail({
  from: { email: 'newsletter@yourdomain.com' },
  to: [{ email: 'subscriber@example.com' }],
  subject: 'Monthly Newsletter',
  htmlContent: '<h1>Our Monthly Update</h1><p>Latest news and updates...</p>',
  tag: 'newsletter',
  tracking: {
    opens: true,
    clicks: true,
    unsubscribes: true,
    unsubscribeGroupId: 123,
    // ignored if unsubscribeGroupId is set
    unsubscribeGroupName: 'Newsletters',
  },
  webhookData: {
    campaign_id: 'camp_123'
  }
});

// Scheduled email
await client.sendEmail({
  from: { email: 'sender@yourdomain.com' },
  to: [{ email: 'recipient@example.com' }],
  subject: 'Scheduled',
  textContent: 'This will be sent later.',
  sendTime: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
});
```

## Domain, unsubscribe groups, and analytics

These endpoints live on the organization API host. Point the client at it:

```typescript
const client = new LanefulClient(
  'https://api.laneful.net',
  'your-auth-token'
);
```

Development uses `https://api.dev.laneful.net`.

### Unsubscribe groups

```typescript
const groups = await client.listUnsubscribeGroups(42, { limit: 50 });
const created = await client.createUnsubscribeGroup(42, 'Newsletters');
const updated = await client.updateUnsubscribeGroup(
  42,
  created.unsubscribeGroupId,
  'Weekly Newsletters'
);
```

### Domains

```typescript
const listing = await client.listDomains(42, { limit: 50 });
const domain = await client.createDomain(42, {
  domain: 'mydomain.com',
  tracking: 'tracking',
  returnPath: 'return-path',
});
await client.getDomain(42, 'mydomain.com');
await client.verifyDomain(42, 'mydomain.com');

// Set the email track; pass "" to clear it, or omit emailTrackId to leave it unchanged
await client.updateDomain(42, 'mydomain.com', {
  emailTrackId: 'e59f0a35-05bc-4516-b585-c06f69c3e67e',
});

await client.deleteDomain(42, 'mydomain.com');
```

### Deliverability analytics

```typescript
const radar = await client.listDomainSpamRatioRadar({
  workspaceIds: [1, 2],
  domain: 'example.com',
  startDate: '2026-09-01',
  endDate: '2026-09-08',
});

const postmaster = await client.listGooglePostmasterSpamReports({
  domain: 'example.com',
});

const snds = await client.listSndsReports({ ip: '203.0.113.5' });
```

## Error Handling

```typescript
import { LanefulAPIError, LanefulAuthError, LanefulValidationError } from 'laneful';

try {
  await client.sendEmail(email);
} catch (error) {
  if (error instanceof LanefulValidationError) {
        console.error('Validation error:', error.message);
    } else if (error instanceof LanefulAuthError) {
        console.error('Authentication failed');
    } else if (error instanceof LanefulAPIError) {
        console.error('API error:', error.statusCode);
    } else {
        console.error('Error:', error.message);
    }
}
```

## Development

```bash
npm install   # Install dependencies
npm test      # Run tests
npm run build # Build the project
```

