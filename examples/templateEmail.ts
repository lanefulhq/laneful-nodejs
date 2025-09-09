import { LanefulAPIError, LanefulAuthError, LanefulClient, LanefulValidationError } from 'laneful';

// Initialize the client
const client = new LanefulClient(
    'https://custom-endpoint.send.laneful.net',
    'your-auth-token'
);

try {
    const response = await client.sendEmail({
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
