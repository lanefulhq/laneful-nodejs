import { createHmac } from 'crypto';
import { WebhookHandler } from '../../webhooks/WebhookHandler';
import { WebhookEvent } from '../../webhooks/WebhookTypes';

describe('WebhookHandler', () => {
  const webhookSecret = 'test-secret';
  const samplePayload = {
    event_type: 'email.delivered',
    message_id: 'msg-123',
    email: 'test@example.com',
    timestamp: 1234567890,
    data: { additional: 'info' },
  };

  describe('constructor', () => {
    it('should create handler without secret', () => {
      expect(() => new WebhookHandler()).not.toThrow();
    });

    it('should create handler with secret', () => {
      expect(() => new WebhookHandler(webhookSecret)).not.toThrow();
    });
  });

  describe('verifySignature', () => {
    let handler: WebhookHandler;

    beforeEach(() => {
      handler = new WebhookHandler(webhookSecret);
    });

    it('should verify valid signature', () => {
      const payload = JSON.stringify(samplePayload);
      const signature = createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      expect(handler.verifySignature(payload, `sha256=${signature}`)).toBe(
        true
      );
    });

    it('should reject invalid signature', () => {
      const payload = JSON.stringify(samplePayload);
      const invalidSignature = 'invalid-signature';

      expect(
        handler.verifySignature(payload, `sha256=${invalidSignature}`)
      ).toBe(false);
    });

    it('should handle signature without sha256 prefix', () => {
      const payload = JSON.stringify(samplePayload);
      const signature = createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      expect(handler.verifySignature(payload, signature)).toBe(true);
    });

    it('should skip verification when no secret is configured', () => {
      const handlerWithoutSecret = new WebhookHandler();
      const payload = JSON.stringify(samplePayload);

      expect(
        handlerWithoutSecret.verifySignature(payload, 'any-signature')
      ).toBe(true);
    });

    it('should handle Buffer payload', () => {
      const payload = Buffer.from(JSON.stringify(samplePayload));
      const signature = createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      expect(handler.verifySignature(payload, `sha256=${signature}`)).toBe(
        true
      );
    });
  });

  describe('event handling', () => {
    let handler: WebhookHandler;
    let mockHandler: jest.Mock;

    beforeEach(() => {
      handler = new WebhookHandler();
      mockHandler = jest.fn();
    });

    it('should register and call event handler', async () => {
      handler.registerHandler('email.delivered', mockHandler);

      await handler.processWebhook(samplePayload);

      expect(mockHandler).toHaveBeenCalledWith({
        eventType: 'email.delivered',
        messageId: 'msg-123',
        email: 'test@example.com',
        timestamp: 1234567890,
        data: { additional: 'info' },
      });
    });

    it('should handle JSON string payload', async () => {
      handler.registerHandler('email.delivered', mockHandler);

      await handler.processWebhook(JSON.stringify(samplePayload));

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should throw for invalid JSON', async () => {
      await expect(handler.processWebhook('invalid-json')).rejects.toThrow(
        'Invalid JSON payload'
      );
    });

    it('should throw for missing event_type', async () => {
      const invalidPayload = { ...samplePayload };
      delete (invalidPayload as any).event_type;

      await expect(handler.processWebhook(invalidPayload)).rejects.toThrow(
        'Webhook payload missing required field: event_type'
      );
    });

    it('should not call handler for unregistered event', async () => {
      handler.registerHandler('email.bounced', mockHandler);

      await handler.processWebhook(samplePayload);

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should support on() decorator pattern', async () => {
      const decoratedHandler = handler.on('email.delivered')(mockHandler);

      await handler.processWebhook(samplePayload);

      expect(mockHandler).toHaveBeenCalled();
      expect(decoratedHandler).toBe(mockHandler);
    });

    it('should remove event handlers', async () => {
      handler.registerHandler('email.delivered', mockHandler);
      handler.removeHandler('email.delivered');

      await handler.processWebhook(samplePayload);

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should get registered event types', () => {
      handler.registerHandler('email.delivered', mockHandler);
      handler.registerHandler('email.bounced', mockHandler);

      const eventTypes = handler.getRegisteredEventTypes();

      expect(eventTypes).toContain('email.delivered');
      expect(eventTypes).toContain('email.bounced');
      expect(eventTypes).toHaveLength(2);
    });

    it('should manually trigger event handler', async () => {
      handler.registerHandler('email.delivered', mockHandler);

      const event: WebhookEvent = {
        eventType: 'email.delivered',
        messageId: 'msg-456',
        email: 'manual@example.com',
        timestamp: 9876543210,
        data: {},
      };

      await handler.handleEvent('email.delivered', event);

      expect(mockHandler).toHaveBeenCalledWith(event);
    });

    it('should handle async event handlers', async () => {
      const asyncHandler = jest.fn().mockResolvedValue(undefined);
      handler.registerHandler('email.delivered', asyncHandler);

      await handler.processWebhook(samplePayload);

      expect(asyncHandler).toHaveBeenCalled();
    });
  });
});
