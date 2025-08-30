/* eslint-disable no-console */
/**
 * Advanced example of sending multiple emails in bulk with different scenarios
 */

import { LanefulClient, Email } from '../src';

async function sendBulkEmails(): Promise<void> {
  const client = new LanefulClient(
    'https://your-endpoint.send.laneful.net',
    'your-auth-token',
    {
      // Configure retry and rate limiting for bulk operations
      retry: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 5000,
      },
      rateLimit: {
        maxRequests: 50,
        windowMs: 60000, // 1 minute
      },
    }
  );

  // Example 1: Newsletter to multiple recipients
  await sendNewsletter(client);

  // Example 2: Personalized transactional emails
  await sendPersonalizedEmails(client);

  // Example 3: Bulk emails with error handling
  await sendBulkWithErrorHandling(client);
}

async function sendNewsletter(client: LanefulClient): Promise<void> {
  console.log('=== Sending Newsletter to Multiple Recipients ===');

  const subscribers = [
    {
      email: 'user1@example.com',
      name: 'Alice Johnson',
      preferences: { frequency: 'weekly' },
    },
    {
      email: 'user2@example.com',
      name: 'Bob Smith',
      preferences: { frequency: 'monthly' },
    },
    {
      email: 'user3@example.com',
      name: 'Carol Davis',
      preferences: { frequency: 'weekly' },
    },
    {
      email: 'user4@example.com',
      name: 'David Wilson',
      preferences: { frequency: 'daily' },
    },
  ];

  // Filter subscribers based on preferences
  const weeklySubscribers = subscribers.filter(
    (sub) => sub.preferences.frequency === 'weekly'
  );

  const emails: Email[] = weeklySubscribers.map((user) => ({
    from: {
      email: 'newsletter@yourcompany.com',
      name: 'Your Company Newsletter',
    },
    to: [user],
    subject: `Weekly Update for ${user.name} - March 2024`,
    htmlContent: `
      <h1>Hello ${user.name}!</h1>
      <h2>This Week's Updates</h2>
      <ul>
        <li>🚀 New feature launches</li>
        <li>📊 Product updates and metrics</li>
        <li>🎉 Community highlights</li>
        <li>📈 Performance improvements</li>
      </ul>
      <p>Thanks for being a valued member of our weekly updates!</p>
      <p><a href="https://yourcompany.com/unsubscribe/${user.email}">Unsubscribe</a></p>
    `,
    textContent: `
      Hello ${user.name}!
      
      This Week's Updates:
      🚀 New feature launches
      📊 Product updates and metrics
      🎉 Community highlights
      📈 Performance improvements
      
      Thanks for being a valued member of our weekly updates!
      
      Unsubscribe: https://yourcompany.com/unsubscribe/${user.email}
    `,
    tag: 'weekly-newsletter',
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: true,
      unsubscribeGroupId: 1,
    },
  }));

  try {
    const responses = await client.sendEmails(emails);

    const successful = responses.filter((r) => r.success).length;
    const failed = responses.filter((r) => !r.success).length;

    console.log(`Newsletter Results: ${successful} sent, ${failed} failed`);

    responses.forEach((response, index) => {
      if (response.success) {
        console.log(
          `✅ ${weeklySubscribers[index]?.email}: Email sent successfully`
        );
      } else {
        console.log(`❌ ${weeklySubscribers[index]?.email}: ${response.error}`);
      }
    });
  } catch (error) {
    console.error('Newsletter sending failed:', error);
  }
}

async function sendPersonalizedEmails(client: LanefulClient): Promise<void> {
  console.log('\n=== Sending Personalized Transactional Emails ===');

  const orders = [
    {
      id: 'ORD-001',
      customerEmail: 'customer1@example.com',
      customerName: 'Alice Johnson',
      items: ['Premium Plan', 'Extra Storage'],
      total: 99.99,
      deliveryDate: '2024-03-15',
    },
    {
      id: 'ORD-002',
      customerEmail: 'customer2@example.com',
      customerName: 'Bob Smith',
      items: ['Basic Plan'],
      total: 29.99,
      deliveryDate: '2024-03-16',
    },
    {
      id: 'ORD-003',
      customerEmail: 'customer3@example.com',
      customerName: 'Carol Davis',
      items: ['Enterprise Plan', 'Premium Support'],
      total: 299.99,
      deliveryDate: '2024-03-17',
    },
  ];

  const emails: Email[] = orders.map((order) => ({
    from: {
      email: 'orders@yourcompany.com',
      name: 'Your Company Orders',
    },
    to: [{ email: order.customerEmail, name: order.customerName }],
    cc: [{ email: 'admin@yourcompany.com', name: 'Order Admin' }],
    subject: `Order Confirmation #${order.id} - Thank you ${order.customerName}!`,
    htmlContent: `
      <h1>Order Confirmed!</h1>
      <p>Hi ${order.customerName},</p>
      <p>Thank you for your order #${order.id}. Here are the details:</p>
      
      <h3>Items Ordered:</h3>
      <ul>
        ${order.items.map((item) => `<li>${item}</li>`).join('')}
      </ul>
      
      <p><strong>Total: $${order.total}</strong></p>
      <p><strong>Expected Delivery: ${order.deliveryDate}</strong></p>
      
      <p>We'll send you updates as your order progresses.</p>
      <p>Best regards,<br>Your Company Team</p>
    `,
    textContent: `
      Order Confirmed!
      
      Hi ${order.customerName},
      
      Thank you for your order #${order.id}. Here are the details:
      
      Items Ordered:
      ${order.items.map((item) => `- ${item}`).join('\n')}
      
      Total: $${order.total}
      Expected Delivery: ${order.deliveryDate}
      
      We'll send you updates as your order progresses.
      
      Best regards,
      Your Company Team
    `,
    tag: 'order-confirmation',
    webhookData: {
      orderId: order.id,
      customerType: order.total > 100 ? 'premium' : 'standard',
    },
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: false, // Transactional emails shouldn't have unsubscribe
    },
  }));

  try {
    const responses = await client.sendEmails(emails);

    console.log('Order confirmation results:');
    responses.forEach((response, index) => {
      const order = orders[index];
      if (response.success) {
        console.log(
          `✅ Order ${order?.id} confirmation sent to ${order?.customerEmail}`
        );
      } else {
        console.log(`❌ Order ${order?.id} failed: ${response.error}`);
      }
    });
  } catch (error) {
    console.error('Order confirmations failed:', error);
  }
}

async function sendBulkWithErrorHandling(client: LanefulClient): Promise<void> {
  console.log('\n=== Bulk Send with Mixed Valid/Invalid Emails ===');

  const emails: Email[] = [
    // Valid email
    {
      from: { email: 'sender@yourcompany.com', name: 'Your Company' },
      to: [{ email: 'valid1@example.com', name: 'Valid User 1' }],
      subject: 'Valid Email 1',
      textContent: 'This email should send successfully.',
    },
    // Invalid email (bad format)
    {
      from: { email: 'sender@yourcompany.com', name: 'Your Company' },
      to: [{ email: 'invalid-email-format', name: 'Invalid User' }],
      subject: 'Invalid Email',
      textContent: 'This email will fail validation.',
    },
    // Valid email
    {
      from: { email: 'sender@yourcompany.com', name: 'Your Company' },
      to: [{ email: 'valid2@example.com', name: 'Valid User 2' }],
      subject: 'Valid Email 2',
      textContent: 'This email should also send successfully.',
    },
    // Missing content (invalid)
    {
      from: { email: 'sender@yourcompany.com', name: 'Your Company' },
      to: [{ email: 'valid3@example.com', name: 'Valid User 3' }],
      subject: 'Missing Content',
      // No textContent, htmlContent, or templateId - will fail validation
    } as Email,
  ];

  try {
    const responses = await client.sendEmails(emails);

    console.log('\nDetailed Results:');
    responses.forEach((response, index) => {
      console.log(`\nEmail ${index + 1}:`);
      console.log(`  Status: ${response.status}`);
      console.log(`  Success: ${response.success}`);
      if (!response.success && response.error) {
        console.log(`  Error Message: ${response.error}`);
      }
    });

    // Summary statistics
    const stats = {
      total: responses.length,
      successful: responses.filter((r) => r.success).length,
      failed: responses.filter((r) => !r.success).length,
      validationErrors: responses.filter(
        (r) => r.status === 'validation_failed'
      ).length,
    };

    console.log('\nSummary:');
    console.log(`  Total emails: ${stats.total}`);
    console.log(`  Successful: ${stats.successful}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log(`  Validation errors: ${stats.validationErrors}`);
  } catch (error) {
    console.error('Bulk send failed completely:', error);
  }
}

// Run the example
sendBulkEmails();
