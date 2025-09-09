import { LanefulClient, Email, LanefulValidationError, LanefulAuthError, LanefulAPIError } from 'laneful';

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
