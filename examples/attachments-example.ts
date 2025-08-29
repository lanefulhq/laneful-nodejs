/* eslint-disable no-console */
/**
 * Advanced example demonstrating email attachments and inline content
 */

import { LanefulClient, Email, Attachment } from '../src';

async function demonstrateAttachments(): Promise<void> {
  const client = new LanefulClient(
    'https://your-endpoint.send.laneful.net',
    'your-auth-token'
  );

  // Example 1: Email with file attachments
  await sendEmailWithFileAttachments(client);

  // Example 2: Email with inline images
  await sendEmailWithInlineImages(client);

  // Example 3: Mixed attachments and inline content
  await sendEmailWithMixedContent(client);

  // Example 4: Bulk emails with attachments
  await sendBulkEmailsWithAttachments(client);
}

async function sendEmailWithFileAttachments(
  client: LanefulClient
): Promise<void> {
  console.log('=== Sending Email with File Attachments ===');

  // Simulate reading files (in practice, you'd read actual files)
  const pdfDocument = createMockBase64Content('PDF document content');
  const csvReport = createMockBase64Content(
    'Name,Email,Status\nJohn Doe,john@example.com,Active'
  );
  const imageFile = createMockBase64Content('Mock image binary data');

  const attachments: Attachment[] = [
    {
      contentType: 'application/pdf',
      fileName: 'monthly-report.pdf',
      content: pdfDocument,
    },
    {
      contentType: 'text/csv',
      fileName: 'user-export.csv',
      content: csvReport,
    },
    {
      contentType: 'image/png',
      fileName: 'chart.png',
      content: imageFile,
    },
  ];

  const email: Email = {
    from: {
      email: 'reports@yourcompany.com',
      name: 'Your Company Reports',
    },
    to: [
      {
        email: 'manager@example.com',
        name: 'Department Manager',
      },
    ],
    subject: 'Monthly Report - March 2024',
    htmlContent: `
      <h1>Monthly Report</h1>
      <p>Dear Manager,</p>
      <p>Please find attached the monthly report for March 2024:</p>
      <ul>
        <li><strong>monthly-report.pdf</strong> - Detailed analytics and insights</li>
        <li><strong>user-export.csv</strong> - User activity data export</li>
        <li><strong>chart.png</strong> - Key metrics visualization</li>
      </ul>
      <p>Please review the documents and let me know if you have any questions.</p>
      <p>Best regards,<br>Reporting Team</p>
    `,
    textContent: `
      Monthly Report
      
      Dear Manager,
      
      Please find attached the monthly report for March 2024:
      
      - monthly-report.pdf: Detailed analytics and insights
      - user-export.csv: User activity data export
      - chart.png: Key metrics visualization
      
      Please review the documents and let me know if you have any questions.
      
      Best regards,
      Reporting Team
    `,
    attachments,
    tag: 'monthly-report',
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: false, // Transactional email
    },
  };

  try {
    const response = await client.sendEmail(email);

    if (response.success) {
      console.log(
        `✅ Email with ${attachments.length} attachments sent successfully`
      );
      console.log('   Email sent successfully');
      console.log(
        `   Attachments: ${attachments.map((a) => a.fileName).join(', ')}`
      );
    } else {
      console.log(`❌ Failed to send email: ${response.error}`);
    }
  } catch (error) {
    console.error('Email with attachments failed:', error);
  }
}

async function sendEmailWithInlineImages(client: LanefulClient): Promise<void> {
  console.log('\n=== Sending Email with Inline Images ===');

  // Mock inline images
  const logoImage = createMockBase64Content('Company logo image data');
  const bannerImage = createMockBase64Content('Email banner image data');
  const footerImage = createMockBase64Content('Footer signature image data');

  const inlineAttachments: Attachment[] = [
    {
      contentType: 'image/png',
      inlineId: 'company-logo',
      content: logoImage,
    },
    {
      contentType: 'image/jpeg',
      inlineId: 'email-banner',
      content: bannerImage,
    },
    {
      contentType: 'image/png',
      inlineId: 'footer-signature',
      content: footerImage,
    },
  ];

  const email: Email = {
    from: {
      email: 'marketing@yourcompany.com',
      name: 'Your Company Marketing',
    },
    to: [
      {
        email: 'customer@example.com',
        name: 'Valued Customer',
      },
    ],
    subject: '🎉 New Product Launch - Special Offer Inside!',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .header { text-align: center; padding: 20px; }
          .content { max-width: 600px; margin: 0 auto; padding: 20px; }
          .footer { text-align: center; padding: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="cid:company-logo" alt="Your Company Logo" style="max-width: 200px;">
        </div>
        
        <div class="content">
          <img src="cid:email-banner" alt="Product Launch Banner" style="width: 100%; max-width: 600px;">
          
          <h1>Introducing Our Latest Innovation!</h1>
          <p>Dear Valued Customer,</p>
          <p>We're excited to announce the launch of our newest product that will revolutionize how you work.</p>
          
          <h2>Special Launch Offer</h2>
          <ul>
            <li>50% off for the first month</li>
            <li>Free setup and migration</li>
            <li>Dedicated support team</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="https://yourcompany.com/new-product" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Get Started Now
            </a>
          </p>
        </div>
        
        <div class="footer">
          <img src="cid:footer-signature" alt="Team Signature" style="max-width: 300px;">
          <p>Thank you for choosing Your Company!</p>
        </div>
      </body>
      </html>
    `,
    textContent: `
      Introducing Our Latest Innovation!
      
      Dear Valued Customer,
      
      We're excited to announce the launch of our newest product that will revolutionize how you work.
      
      Special Launch Offer:
      - 50% off for the first month
      - Free setup and migration
      - Dedicated support team
      
      Get started now: https://yourcompany.com/new-product
      
      Thank you for choosing Your Company!
    `,
    attachments: inlineAttachments,
    tag: 'product-launch',
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: true,
      unsubscribeGroupId: 2,
    },
  };

  try {
    const response = await client.sendEmail(email);
    if (response.success) {
      console.log(
        `✅ Email with ${inlineAttachments.length} inline images sent successfully`
      );
      console.log('   Email sent successfully');
      console.log(
        `   Inline images: ${inlineAttachments.map((a) => a.inlineId).join(', ')}`
      );
    } else {
      console.log(`❌ Failed to send email: ${response.error}`);
    }
  } catch (error) {
    console.error('Email with inline images failed:', error);
  }
}

async function sendEmailWithMixedContent(client: LanefulClient): Promise<void> {
  console.log(
    '\n=== Sending Email with Mixed Attachments and Inline Content ==='
  );

  const attachments: Attachment[] = [
    // File attachment
    {
      contentType: 'application/pdf',
      fileName: 'invoice-2024-001.pdf',
      content: createMockBase64Content('Invoice PDF content'),
    },
    // Inline logo
    {
      contentType: 'image/png',
      inlineId: 'invoice-logo',
      content: createMockBase64Content('Invoice logo image'),
    },
    // File attachment (receipt)
    {
      contentType: 'text/plain',
      fileName: 'payment-receipt.txt',
      content: createMockBase64Content('Payment confirmation receipt'),
    },
  ];

  const email: Email = {
    from: {
      email: 'billing@yourcompany.com',
      name: 'Your Company Billing',
    },
    to: [
      {
        email: 'customer@example.com',
        name: 'John Smith',
      },
    ],
    cc: [
      {
        email: 'accounting@yourcompany.com',
        name: 'Accounting Department',
      },
    ],
    subject: 'Invoice #2024-001 - Payment Confirmed',
    htmlContent: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="text-align: center; padding: 20px;">
          <img src="cid:invoice-logo" alt="Company Logo" style="max-width: 150px;">
        </div>
        
        <h1 style="color: #333;">Payment Confirmation</h1>
        <p>Dear John Smith,</p>
        
        <p>Thank you for your payment! Your invoice has been successfully processed.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Invoice Details</h3>
          <ul>
            <li><strong>Invoice Number:</strong> #2024-001</li>
            <li><strong>Amount:</strong> $1,250.00</li>
            <li><strong>Payment Date:</strong> March 15, 2024</li>
            <li><strong>Payment Method:</strong> Credit Card ending in 4321</li>
          </ul>
        </div>
        
        <h3>Attached Documents</h3>
        <ul>
          <li>📄 <strong>invoice-2024-001.pdf</strong> - Complete invoice with itemized charges</li>
          <li>📄 <strong>payment-receipt.txt</strong> - Payment confirmation receipt</li>
        </ul>
        
        <p>Please save these documents for your records. If you have any questions, please don't hesitate to contact our billing department.</p>
        
        <p>Best regards,<br>Your Company Billing Team</p>
      </div>
    `,
    textContent: `
      Payment Confirmation
      
      Dear John Smith,
      
      Thank you for your payment! Your invoice has been successfully processed.
      
      Invoice Details:
      - Invoice Number: #2024-001
      - Amount: $1,250.00
      - Payment Date: March 15, 2024
      - Payment Method: Credit Card ending in 4321
      
      Attached Documents:
      - invoice-2024-001.pdf: Complete invoice with itemized charges
      - payment-receipt.txt: Payment confirmation receipt
      
      Please save these documents for your records. If you have any questions, please don't hesitate to contact our billing department.
      
      Best regards,
      Your Company Billing Team
    `,
    attachments,
    tag: 'invoice-payment',
    webhookData: {
      invoiceId: '2024-001',
      paymentAmount: '1250.00',
      customerId: 'CUST-12345',
    },
    tracking: {
      opens: true,
      clicks: true,
      unsubscribes: false, // Transactional email
    },
  };

  try {
    const response = await client.sendEmail(email);

    if (response.success) {
      const fileAttachments = attachments.filter((a) => a.fileName).length;
      const inlineAttachments = attachments.filter((a) => a.inlineId).length;

      console.log(`✅ Email with mixed content sent successfully`);
      console.log('   Email sent successfully');
      console.log(`   File attachments: ${fileAttachments}`);
      console.log(`   Inline attachments: ${inlineAttachments}`);
    } else {
      console.log(`❌ Failed to send email: ${response.error}`);
    }
  } catch (error) {
    console.error('Email with mixed content failed:', error);
  }
}

async function sendBulkEmailsWithAttachments(
  client: LanefulClient
): Promise<void> {
  console.log('\n=== Sending Bulk Emails with Different Attachments ===');

  const sharedLogo = createMockBase64Content('Company logo for all emails');
  const customers = [
    {
      id: 'CUST-001',
      email: 'alice@example.com',
      name: 'Alice Johnson',
      plan: 'Premium',
    },
    {
      id: 'CUST-002',
      email: 'bob@example.com',
      name: 'Bob Smith',
      plan: 'Basic',
    },
    {
      id: 'CUST-003',
      email: 'carol@example.com',
      name: 'Carol Davis',
      plan: 'Enterprise',
    },
  ];

  const emails: Email[] = customers.map((customer) => {
    // Create personalized attachments for each customer
    const attachments: Attachment[] = [
      // Shared company logo (inline)
      {
        contentType: 'image/png',
        inlineId: 'company-logo',
        content: sharedLogo,
      },
      // Personalized usage report
      {
        contentType: 'application/pdf',
        fileName: `usage-report-${customer.id}.pdf`,
        content: createMockBase64Content(
          `Usage report for ${customer.name} - ${customer.plan} plan`
        ),
      },
    ];

    // Add plan-specific attachments
    if (customer.plan === 'Enterprise') {
      attachments.push({
        contentType: 'text/csv',
        fileName: `detailed-analytics-${customer.id}.csv`,
        content: createMockBase64Content(
          `Detailed analytics data for ${customer.name}`
        ),
      });
    }

    return {
      from: {
        email: 'reports@yourcompany.com',
        name: 'Your Company Reports',
      },
      to: [{ email: customer.email, name: customer.name }],
      subject: `Your ${customer.plan} Plan Usage Report - March 2024`,
      htmlContent: `
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px;">
            <img src="cid:company-logo" alt="Company Logo" style="max-width: 200px;">
          </div>
          
          <h1>Monthly Usage Report</h1>
          <p>Hello ${customer.name},</p>
          
          <p>Your ${customer.plan} plan usage report for March 2024 is ready!</p>
          
          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Included in this report:</h3>
            <ul>
              <li>📊 Usage statistics and trends</li>
              <li>💼 Account activity summary</li>
              <li>📈 Performance metrics</li>
              ${customer.plan === 'Enterprise' ? '<li>📋 Detailed analytics export (CSV)</li>' : ''}
            </ul>
          </div>
          
          <p>Please find your personalized report attached to this email.</p>
          
          <p>Thank you for choosing the ${customer.plan} plan!</p>
          <p>Your Company Team</p>
        </div>
      `,
      textContent: `
        Monthly Usage Report
        
        Hello ${customer.name},
        
        Your ${customer.plan} plan usage report for March 2024 is ready!
        
        Included in this report:
        - Usage statistics and trends
        - Account activity summary
        - Performance metrics
        ${customer.plan === 'Enterprise' ? '- Detailed analytics export (CSV)' : ''}
        
        Please find your personalized report attached to this email.
        
        Thank you for choosing the ${customer.plan} plan!
        Your Company Team
      `,
      attachments,
      tag: 'usage-report',
      webhookData: {
        customerId: customer.id,
        plan: customer.plan,
        reportMonth: '2024-03',
      },
      tracking: {
        opens: true,
        clicks: true,
        unsubscribes: true,
        unsubscribeGroupId: 3,
      },
    };
  });

  try {
    const responses = await client.sendEmails(emails);

    console.log('Bulk emails with attachments results:');
    responses.forEach((response, index) => {
      const customer = customers[index];
      if (response.success) {
        const attachmentCount = emails[index]?.attachments?.length || 0;
        console.log(
          `✅ ${customer?.name} (${customer?.plan}): ${attachmentCount} attachments sent`
        );
      } else {
        console.log(`❌ ${customer?.name}: ${response.error}`);
      }
    });

    const successful = responses.filter((r) => r.success).length;
    const totalAttachments = emails.reduce(
      (sum, email) => sum + (email.attachments?.length || 0),
      0
    );

    console.log(
      `\nSummary: ${successful}/${responses.length} emails sent with ${totalAttachments} total attachments`
    );
  } catch (error) {
    console.error('Bulk emails with attachments failed:', error);
  }
}

/**
 * Helper function to create mock base64 content
 * In a real application, you would read actual files and convert them to base64
 */
function createMockBase64Content(content: string): string {
  // Return mock base64 content (this is just for demo purposes)
  // In a real application, you would use Buffer.from(content).toString('base64')
  // or fs.readFileSync(filePath, { encoding: 'base64' })
  return btoa(content);
}

// Run the attachments demonstration
demonstrateAttachments().catch(console.error);
