import { Email, validateEmail, emailToApiFormat } from '../../models/Email';
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

  describe('validateEmail', () => {
    it('should validate a complete email', () => {
      const email: Email = {
        from: validFromAddress,
        to: [validToAddress],
        subject: 'Test Subject',
        textContent: 'Test content',
      };

      expect(() => validateEmail(email)).not.toThrow();
    });

    it('should validate email with HTML content', () => {
      const email: Email = {
        from: validFromAddress,
        to: [validToAddress],
        subject: 'Test Subject',
        htmlContent: '<h1>Test content</h1>',
      };

      expect(() => validateEmail(email)).not.toThrow();
    });

    it('should validate email with template ID', () => {
      const email: Email = {
        from: validFromAddress,
        to: [validToAddress],
        subject: 'Test Subject',
        templateId: 'template-123',
        templateData: { name: 'John' },
      };

      expect(() => validateEmail(email)).not.toThrow();
    });

    it('should throw for missing from address', () => {
      const email = {
        to: [validToAddress],
        subject: 'Test Subject',
        textContent: 'Test content',
      } as unknown as Email;

      expect(() => validateEmail(email)).toThrow(
        'Email must have a from address'
      );
    });

    it('should throw for missing subject', () => {
      const email = {
        from: validFromAddress,
        to: [validToAddress],
        textContent: 'Test content',
      } as unknown as Email;

      expect(() => validateEmail(email)).toThrow(
        'Email must have a valid subject string'
      );
    });

    it('should throw for missing content', () => {
      const email: Email = {
        from: validFromAddress,
        to: [validToAddress],
        subject: 'Test Subject',
      };

      expect(() => validateEmail(email)).toThrow(
        'Email must have either textContent, htmlContent, or templateId'
      );
    });

    it('should throw for no recipients', () => {
      const email: Email = {
        from: validFromAddress,
        subject: 'Test Subject',
        textContent: 'Test content',
      };

      expect(() => validateEmail(email)).toThrow(
        'Email must have at least one recipient'
      );
    });

    it('should validate email with CC recipients only', () => {
      const email: Email = {
        from: validFromAddress,
        cc: [validToAddress],
        subject: 'Test Subject',
        textContent: 'Test content',
      };

      expect(() => validateEmail(email)).not.toThrow();
    });

    it('should validate email with BCC recipients only', () => {
      const email: Email = {
        from: validFromAddress,
        bcc: [validToAddress],
        subject: 'Test Subject',
        textContent: 'Test content',
      };

      expect(() => validateEmail(email)).not.toThrow();
    });

    it('should throw for invalid to address', () => {
      const email: Email = {
        from: validFromAddress,
        to: [{ email: 'invalid-email' }],
        subject: 'Test Subject',
        textContent: 'Test content',
      };

      expect(() => validateEmail(email)).toThrow(
        "Invalid 'to' address at index 0"
      );
    });
  });

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
