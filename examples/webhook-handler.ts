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
webhookHandler.on(WebhookEventType.DELIVERY)((event) => {
  console.log(`✅ Email delivered!`);
  console.log(`  Message ID: ${event.message_id}`);
  console.log(`  Recipient: ${event.email}`);
  console.log(`  Lane ID: ${event.lane_id}`);
  console.log(`  Tag: ${event.tag}`);
  console.log(`  Timestamp: ${new Date(event.timestamp * 1000).toISOString()}`);
  // You can update your database, send notifications, etc.
  // updateEmailStatus(event.message_id, 'delivered');
});

webhookHandler.on(WebhookEventType.OPEN)((event) => {
  console.log(`👀 Email opened!`);
  console.log(`  Message ID: ${event.message_id}`);
  console.log(`  Recipient: ${event.email}`);
  console.log(`  Lane ID: ${event.lane_id}`);
  console.log(`  Tag: ${event.tag}`);
  // Access open-specific fields
  if (event.event === WebhookEventType.OPEN) {
    console.log(`  Client IP: ${event.client_ip}`);
    console.log(`  Client OS: ${event.client_os}`);
    console.log(`  Client Device: ${event.client_device}`);
  }
  // Track email opens in your analytics
  // analytics.track('email_opened', { messageId: event.message_id });
});

webhookHandler.on(WebhookEventType.CLICK)((event) => {
  console.log(`🔗 Email link clicked!`);
  console.log(`  Message ID: ${event.message_id}`);
  console.log(`  Recipient: ${event.email}`);
  console.log(`  Lane ID: ${event.lane_id}`);
  console.log(`  Tag: ${event.tag}`);
  // Access click-specific fields
  if (event.event === WebhookEventType.CLICK) {
    console.log(`  URL: ${event.url}`);
    console.log(`  Client OS: ${event.client_os}`);
    console.log(`  Client Device: ${event.client_device}`);
  }
});

webhookHandler.on(WebhookEventType.DROP)((event) => {
  console.log(`❌ Email dropped!`);
  console.log(`  Message ID: ${event.message_id}`);
  console.log(`  Recipient: ${event.email}`);
  console.log(`  Lane ID: ${event.lane_id}`);
  console.log(`  Tag: ${event.tag}`);
  // Access drop-specific fields
  if (event.event === WebhookEventType.DROP) {
    console.log(`  Reason: ${event.reason}`);
  }
  // Handle dropped emails (update database, remove from list, etc.)
  // handleDroppedEmail(event.email, event.reason);
});

webhookHandler.on(WebhookEventType.SPAM_COMPLAINT)((event) => {
  console.log(`⚠️ Email complaint (spam)!`);
  console.log(`  Message ID: ${event.message_id}`);
  console.log(`  Recipient: ${event.email}`);
  console.log(`  Lane ID: ${event.lane_id}`);
  console.log(`  Tag: ${event.tag}`);
  // Access spam complaint specific fields
  if (event.event === WebhookEventType.SPAM_COMPLAINT) {
    console.log(`  Feedback Type: ${event.feedback_type_text}`);
    console.log(
      `  Received: ${new Date(event.received_unix_timestamp * 1000).toISOString()}`
    );
  }
  // Handle spam complaints (remove from list, investigate, etc.)
  // handleSpamComplaint(event.email);
});

webhookHandler.on(WebhookEventType.UNSUBSCRIBE)((event) => {
  console.log(`📭 Email unsubscribed!`);
  console.log(`  Message ID: ${event.message_id}`);
  console.log(`  Recipient: ${event.email}`);
  console.log(`  Lane ID: ${event.lane_id}`);
  console.log(`  Tag: ${event.tag}`);
  // Access unsubscribe-specific fields
  if (event.event === WebhookEventType.UNSUBSCRIBE) {
    console.log(`  Unsubscribe Group: ${event.unsubscribe_group_id || 'N/A'}`);
  }
  // Handle unsubscribes (update preferences, remove from list, etc.)
  // handleUnsubscribe(event.email);
});

webhookHandler.on(WebhookEventType.BOUNCE)((event) => {
  console.log(`⚠️ Email bounced!`);
  console.log(`  Message ID: ${event.message_id}`);
  console.log(`  Recipient: ${event.email}`);
  console.log(`  Lane ID: ${event.lane_id}`);
  console.log(`  Tag: ${event.tag}`);
  // Access bounce-specific fields
  if (event.event === WebhookEventType.BOUNCE) {
    console.log(`  Bounce Code: ${event.code}`);
    console.log(`  Bounce Text: ${event.text}`);
    console.log(`  Is Hard Bounce: ${event.is_hard}`);
    console.log(
      `  Deliverability Issue: ${event.deliverability_issue || 'N/A'}`
    );
  }
  // Handle bounces (update database, remove from list, etc.)
  // handleBounce(event.email, event.is_hard);
});

// Webhook endpoint
app.post('/webhook/laneful', async (req, res) => {
  try {
    // Get the signature from headers (using standard header name from documentation)
    const signature = req.headers['x-webhook-signature'] as string;
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature header' });
    }

    // Verify the webhook signature
    const rawBody = JSON.stringify(req.body);
    if (!webhookHandler.verifySignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process the webhook (supports both single events and batch mode)
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
