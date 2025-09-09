import { LanefulClient, LanefulValidationError, LanefulAuthError, LanefulAPIError } from 'laneful';

// Initialize the client
const client = new LanefulClient(
    'https://custom-endpoint.send.laneful.net',
    'your-auth-token'
);

try {
    const response = await client.sendEmail({
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
