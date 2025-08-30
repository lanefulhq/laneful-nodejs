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
  'https://your-endpoint.send.laneful.net',
  'your-auth-token'
);

// Create an email
const email: Email = {
  from: { email: 'sender@example.com', name: 'Your Name' },
  to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
  subject: 'Hello from Laneful!',
  textContent: 'This is a plain text email.',
  htmlContent: '<h1>This is an HTML email!</h1>',
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
  sendTime?: number;        // Unix timestamp for scheduling
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
```

## Webhooks

```typescript
import { WebhookHandler } from 'laneful';

const webhookHandler = new WebhookHandler('your-webhook-secret');

// Register event handlers
webhookHandler.on('email.delivered', (event) => {
  console.log(`Email delivered: ${event.messageId}`);
});

// Verify and process webhooks
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-laneful-signature'];
  
  if (!webhookHandler.verifySignature(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  webhookHandler.processWebhook(req.body);
  res.status(200).send('OK');
});
```

**Events:** `email.sent`, `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`, `email.unsubscribed`, `email.failed`

## Examples

```typescript
// Template email
await client.sendEmail({
  from: { email: 'app@example.com' },
  to: [{ email: 'user@example.com' }],
  subject: 'Welcome!',
  templateId: 'welcome-123',
  templateData: { name: 'John', activationLink: 'https://...' }
});

// Email with attachment
await client.sendEmail({
  from: { email: 'sender@example.com' },
  to: [{ email: 'recipient@example.com' }],
  subject: 'Document',
  textContent: 'Please find attached.',
  attachments: [{
    contentType: 'application/pdf',
    fileName: 'doc.pdf',
    content: 'base64-content...'
  }]
});

// Scheduled email
await client.sendEmail({
  from: { email: 'sender@example.com' },
  to: [{ email: 'recipient@example.com' }],
  subject: 'Scheduled',
  textContent: 'This will be sent later.',
  sendTime: Math.floor(Date.now() / 1000) + 3600  // 1 hour from now
});
```

## Error Handling

```typescript
import { LanefulError, LanefulAPIError, LanefulAuthError } from 'laneful';

try {
  await client.sendEmail(email);
} catch (error) {
  if (error instanceof LanefulAuthError) {
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

