import { LanefulAPIError, LanefulAuthError, LanefulClient, LanefulValidationError } from 'laneful';

// Initialize the client
const client = new LanefulClient(
    'https://custom-endpoint.send.laneful.net',
    'your-auth-token'
);

try {
    const response = await client.sendEmail({
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
    console.log('Email sent successfully!', response);
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
