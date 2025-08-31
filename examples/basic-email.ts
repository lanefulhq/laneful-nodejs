/**
 * Basic example of sending an email with the Laneful SDK
 */

import { LanefulClient, Email } from '../src';

async function sendBasicEmail(): Promise<void> {
  // Initialize the client
  const client = new LanefulClient(
    'https://custom-endpoint.send.laneful.net',
    'your-auth-token'
  );

  // Create a basic email
  const email: Email = {
    from: {
      email: 'noreply@yourdomain.com',
      name: 'Your App Name',
    },
    to: [
      {
        email: 'user@example.com',
        name: 'User Name',
      },
    ],
    subject: 'Welcome to Our Service',
    textContent:
      "Hello,\n\nWelcome to our service! We're excited to have you on board.\n\nIf you have any questions, feel free to reach out to our support team.\n\nBest regards,\nThe Team",
    htmlContent:
      "<h1>Welcome!</h1><p>Hello,</p><p>Welcome to our service! We're excited to have you on board.</p><p>If you have any questions, feel free to reach out to our support team.</p><p>Best regards,<br>The Team</p>",
  };

  try {
    // Send the email
    const response = await client.sendEmail(email);

    if (response.success) {
      // eslint-disable-next-line no-console
      console.log('Email sent successfully!');
    } else {
      // eslint-disable-next-line no-console
      console.error('Failed to send email');
      // eslint-disable-next-line no-console
      console.error('Error:', response.error || 'Unknown error');
    }

    // eslint-disable-next-line no-console
    console.log('Status:', response.status);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to send email:', error);
  }
}

// Run the example
sendBasicEmail();
