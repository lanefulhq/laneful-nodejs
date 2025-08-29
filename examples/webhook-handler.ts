/* eslint-disable no-console */
/**
 * Example of handling Laneful webhooks with Express.js
 */

import express from 'express';
import { WebhookHandler, WebhookEventType } from '../src';

const app = express();
const port = 3000;

// Parse JSON bodies
app.use(express.json());

// Initialize webhook handler with your secret
const webhookHandler = new WebhookHandler('your-webhook-secret');

// Register event handlers
webhookHandler.on(WebhookEventType.EMAIL_DELIVERED)((event) => {
  console.log(`✅ Email delivered!`);
  console.log(`  Message ID: ${event.messageId}`);
  console.log(`  Recipient: ${event.email}`);
  console.log(`  Timestamp: ${new Date(event.timestamp * 1000).toISOString()}`);
  // You can update your database, send notifications, etc.
  // updateEmailStatus(event.messageId, 'delivered');
});

webhookHandler.on(WebhookEventType.EMAIL_OPENED)((event) => {
  console.log(`👀 Email opened!`);
  console.log(`  Message ID: ${event.messageId}`);
  console.log(`  Recipient: ${event.email}`);
  // Track email opens in your analytics
  // analytics.track('email_opened', { messageId: event.messageId });
});

webhookHandler.on(WebhookEventType.EMAIL_CLICKED)((event) => {
  console.log(`🔗 Email link clicked!`);
  console.log(`  Message ID: ${event.messageId}`);
  console.log(`  Recipient: ${event.email}`);
  console.log(`  URL: ${event.data.url}`);
});

webhookHandler.on(WebhookEventType.EMAIL_BOUNCED)((event) => {
  console.log(`❌ Email bounced!`);
  console.log(`  Message ID: ${event.messageId}`);
  console.log(`  Recipient: ${event.email}`);
  console.log(`  Reason: ${event.data.reason}`);
  // Handle bounced emails (update database, remove from list, etc.)
  // handleBouncedEmail(event.email, event.data.reason);
});

webhookHandler.on(WebhookEventType.EMAIL_COMPLAINED)((event) => {
  console.log(`⚠️ Email complaint (spam)!`);
  console.log(`  Message ID: ${event.messageId}`);
  console.log(`  Recipient: ${event.email}`);
  // Handle spam complaints (remove from list, investigate, etc.)
  // handleSpamComplaint(event.email);
});

webhookHandler.on(WebhookEventType.EMAIL_UNSUBSCRIBED)((event) => {
  console.log(`📭 Email unsubscribed!`);
  console.log(`  Message ID: ${event.messageId}`);
  console.log(`  Recipient: ${event.email}`);
  // Handle unsubscribes (update preferences, remove from list, etc.)
  // handleUnsubscribe(event.email);
});

// Webhook endpoint
app.post('/webhook/laneful', async (req, res) => {
  try {
    // Get the signature from headers
    const signature = req.headers['x-laneful-signature'] as string;
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature header' });
    }

    // Verify the webhook signature
    const rawBody = JSON.stringify(req.body);
    if (!webhookHandler.verifySignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process the webhook
    await webhookHandler.processWebhook(req.body);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return res.status(500).json({ error: 'Processing failed' });
  }
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
  console.log(`Webhook endpoint: http://localhost:${port}/webhook/laneful`);
  console.log(`Health check: http://localhost:${port}/health`);
});
