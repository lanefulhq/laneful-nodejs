/**
 * Basic example of sending an email with the Laneful SDK
 */

import { LanefulClient, Email } from '../src';

async function sendBasicEmail(): Promise<void> {
  // Initialize the client
  const client = new LanefulClient(
    'https://your-endpoint.send.laneful.net',
    'your-auth-token'
  );

  // Create a basic email
  const email: Email = {
    from: {
      email: 'sender@yourcompany.com',
      name: 'Your Company',
    },
    to: [
      {
        email: 'recipient@example.com',
        name: 'John Doe',
      },
    ],
    subject: 'Welcome to our service!',
    textContent: `
      Hello John!
      
      Welcome to our service. We're excited to have you on board.
      
      Best regards,
      Your Company Team
    `,
    htmlContent: `
      <h1>Hello John!</h1>
      <p>Welcome to our service. We're excited to have you on board.</p>
      <p>Best regards,<br>Your Company Team</p>
    `,
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
