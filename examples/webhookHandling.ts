import express from 'express';
import { WebhookHandler, WebhookEventType } from 'laneful';

const app = express();
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
    console.log(`Link clicked: ${event.message_id}`);
    // Access click-specific fields
    if (event.event === WebhookEventType.CLICK) {
        console.log(`URL: ${event.url}`);
        console.log(`Referer: ${event.referer}`);
        console.log(`Client OS: ${event.client_os}`);
    }
});

// Verify and process webhooks (supports both single events and batch mode).
// Verify the raw request body: re-serializing parsed JSON can change the bytes
// and make the signature check fail.
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['x-webhook-signature'];
    const payload = req.body.toString('utf8');

    if (typeof signature !== 'string' || !webhookHandler.verifySignature(payload, signature)) {
        res.status(401).send('Invalid signature');
        return;
    }

    try {
        await webhookHandler.processWebhook(payload);
        res.status(200).send('OK');
    } catch (error) {
        console.error('Webhook processing failed:', error);
        res.status(500).send('Error');
    }
});
