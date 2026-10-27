import { Email, emailToApiFormat } from '../../models/Email';
import { Address } from '../../models/Address';
import { LanefulValidationError } from '../../exceptions';

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

    it('should serialize fromHeader when set', () => {
      const email: Email = {
        from: validFromAddress,
        to: [validToAddress],
        subject: 'Test Subject',
        textContent: 'Test content',
        fromHeader: { email: 'newsletter@example.com', name: 'Newsletter' },
      };

      expect(emailToApiFormat(email).from_header).toEqual({
        email: 'newsletter@example.com',
        name: 'Newsletter',
      });
    });

    it('should reject webhook data with more than 20 keys', () => {
      const webhookData: Record<string, string> = {};
      for (let i = 0; i < 21; i++) {
        webhookData[`k${i}`] = 'v';
      }

      expect(() =>
        emailToApiFormat({
          from: validFromAddress,
          to: [validToAddress],
          subject: 'Test Subject',
          textContent: 'Test content',
          webhookData,
        })
      ).toThrow(LanefulValidationError);
    });

    it('should reject webhook data keys longer than 50 bytes', () => {
      expect(() =>
        emailToApiFormat({
          from: validFromAddress,
          to: [validToAddress],
          subject: 'Test Subject',
          textContent: 'Test content',
          webhookData: { ['k'.repeat(51)]: 'value' },
        })
      ).toThrow(/50 bytes/);
    });

    it('should reject webhook data values longer than 100 bytes', () => {
      expect(() =>
        emailToApiFormat({
          from: validFromAddress,
          to: [validToAddress],
          subject: 'Test Subject',
          textContent: 'Test content',
          webhookData: { key: 'v'.repeat(101) },
        })
      ).toThrow(/100 bytes/);
    });

    // "é" is 2 bytes in UTF-8: 25 fill a 50-byte key and 50 fill a 100-byte value.
    it('should count webhook data lengths in UTF-8 bytes', () => {
      const send = (webhookData: Record<string, string>) => () =>
        emailToApiFormat({
          from: validFromAddress,
          to: [validToAddress],
          subject: 'Test Subject',
          textContent: 'Test content',
          webhookData,
        });

      expect(send({ ['é'.repeat(25)]: 'é'.repeat(50) })).not.toThrow();
      expect(send({ ['é'.repeat(26)]: 'value' })).toThrow(/50 bytes/);
      expect(send({ key: 'é'.repeat(51) })).toThrow(/100 bytes/);
    });
  });
});
