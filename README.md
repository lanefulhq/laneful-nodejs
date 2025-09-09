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

// Send single email
await client.sendEmail(email: Email): Promise<EmailResponse>

// Send bulk emails
await client.sendEmails(emails: Email[]): Promise<EmailResponse[]>
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
  unsubscribeGroupId?: number; // Optional unsubscribe group ID
}
```

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

**Available Events:** `delivery`, `open`, `click`, `drop`, `spam_complaint`, `unsubscribe`, `bounce`

### Event-Specific Fields

- **delivery**: Basic event fields only
- **open**: `referer`, `client_name`, `client_os`, `client_ip`, `client_device`  
- **click**: `url`, `referer`, `client_name`, `client_os`, `client_ip`, `client_device`
- **drop**: `reason`
- **spam_complaint**: `feedback_type`, `feedback_type_text`, `received_unix_timestamp`
- **unsubscribe**: `unsubscribe_group_id` (number)
- **bounce**: `code`, `extended_code`, `text`, `is_hard`, `deliverability_issue`

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
    unsubscribeGroupId: 123
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

