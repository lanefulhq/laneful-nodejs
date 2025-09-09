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