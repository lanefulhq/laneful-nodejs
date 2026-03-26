import { Email, emailToApiFormat } from '../../models/Email';
import { Address } from '../../models/Address';

describe('Email', () => {
  const validFromAddress: Address = {
    email: 'sender@example.com',
    name: 'Sender Name',
  };

  const validToAddress: Address = {
    email: 'recipient@example.com',
    name: 'Recipient Name',
  };

  describe('emailToApiFormat', () => {
    it('should convert complete email to API format', () => {
      const email: Email = {
        from: validFromAddress,
        to: [validToAddress],
        subject: 'Test Subject',
        textContent: 'Test content',
        htmlContent: '<h1>Test content</h1>',
        tag: 'test-tag',
      };

      const result = emailToApiFormat(email);

      expect(result).toEqual({
        from: { email: 'sender@example.com', name: 'Sender Name' },
        to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
        cc: [],
        bcc: [],
        subject: 'Test Subject',
        text_content: 'Test content',
        html_content: '<h1>Test content</h1>',
        template_id: '',
        template_data: {},
        attachments: [],
        headers: {},
        send_time: 0,
        webhook_data: {},
        tag: 'test-tag',
      });
    });

    it('should handle optional fields correctly', () => {
      const email: Email = {
        from: validFromAddress,
        to: [validToAddress],
        subject: 'Test Subject',
        textContent: 'Test content',
        replyTo: { email: 'reply@example.com' },
        tracking: { opens: false, clicks: true },
      };

      const result = emailToApiFormat(email);

      expect(result).toHaveProperty('reply_to', { email: 'reply@example.com' });
      expect(result).toHaveProperty('tracking', {
        opens: false,
        clicks: true,
        unsubscribes: true,
      });
    });
  });
});
