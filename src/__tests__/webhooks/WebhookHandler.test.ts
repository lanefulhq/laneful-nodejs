import { createHmac } from 'crypto';
import { WebhookHandler } from '../../webhooks/WebhookHandler';
import { WebhookEvent, WebhookEventType } from '../../webhooks/WebhookTypes';

describe('WebhookHandler', () => {
  const webhookSecret = 'test-secret';
  const sampleDeliveryPayload = {
    event: 'delivery',
    message_id: 'H-1-019844e340027d728a7cfda632e14d0a',
    email: 'user@example.com',
    lane_id: '5805dd85-ed8c-44db-91a7-1d53a41c86a5',
    metadata: { campaign_id: 'camp_456', user_id: 'user_123' },
    tag: 'newsletter-campaign',
    timestamp: 1753502407,
  };

  const sampleOpenPayload = {
    event: 'open',
    message_id: 'H-1-019844e340027d728a7cfda632e14d0b',
    email: 'user@example.com',
    lane_id: '5805dd85-ed8c-44db-91a7-1d53a41c86a5',
    metadata: { campaign_id: 'camp_456', user_id: 'user_123' },
    tag: 'newsletter-campaign',
    timestamp: 1753502500,
    referer: 'https://example.com/page',
    client_name: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    client_os: 'Windows',
    client_ip: '192.168.1.1',
    client_device: 'Desktop',
  };

  const sampleClickPayload = {
    event: 'click',
    message_id: 'H-1-019844e340027d728a7cfda632e14d0c',
    email: 'user@example.com',
    lane_id: '5805dd85-ed8c-44db-91a7-1d53a41c86a5',
    metadata: {
      campaign_id: 'camp_456',
      user_id: 'user_123',
      link_id: 'cta-button',
    },
    tag: 'newsletter-campaign',
    timestamp: 1753502600,
    url: 'https://example.com/product/123',
    referer: 'https://example.com/newsletter',
    client_name: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
    client_os: 'iOS',
    client_ip: '192.168.1.2',
    client_device: 'Mobile',
  };

  const sampleBouncePayload = {
    event: 'bounce',
    message_id: 'H-1-019844e340027d728a7cfda632e14d0h',
    email: 'invalid@example.com',
    lane_id: '5805dd85-ed8c-44db-91a7-1d53a41c86a5',
    metadata: { campaign_id: 'camp_456' },
    tag: 'newsletter-campaign',
    timestamp: 1753502100,
    code: '550',
    extended_code: '5.1.1',
    text: 'The email account that you tried to reach does not exist.',
    is_hard: true,
    deliverability_issue: 'invalid_recipient',
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
      const payload = JSON.stringify(sampleDeliveryPayload);
      const signature = createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      expect(handler.verifySignature(payload, `sha256=${signature}`)).toBe(
        true
      );
    });

    it('should reject invalid signature', () => {
      const payload = JSON.stringify(sampleDeliveryPayload);
      const invalidSignature = 'invalid-signature';

      expect(
        handler.verifySignature(payload, `sha256=${invalidSignature}`)
      ).toBe(false);
    });

    it('should handle signature without sha256 prefix', () => {
      const payload = JSON.stringify(sampleDeliveryPayload);
      const signature = createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      expect(handler.verifySignature(payload, signature)).toBe(true);
    });

    it('should skip verification when no secret is configured', () => {
      const handlerWithoutSecret = new WebhookHandler();
      const payload = JSON.stringify(sampleDeliveryPayload);

      expect(
        handlerWithoutSecret.verifySignature(payload, 'any-signature')
      ).toBe(true);
    });

    it('should handle Buffer payload', () => {
      const payload = Buffer.from(JSON.stringify(sampleDeliveryPayload));
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

    it('should register and call event handler for delivery', async () => {
      handler.registerHandler('delivery', mockHandler);

      await handler.processWebhook(sampleDeliveryPayload);

      expect(mockHandler).toHaveBeenCalledWith({
        email: 'user@example.com',
        event: 'delivery',
        lane_id: '5805dd85-ed8c-44db-91a7-1d53a41c86a5',
        message_id: 'H-1-019844e340027d728a7cfda632e14d0a',
        metadata: { campaign_id: 'camp_456', user_id: 'user_123' },
        tag: 'newsletter-campaign',
        timestamp: 1753502407,
      });
    });

    it('should handle JSON string payload', async () => {
      handler.registerHandler('delivery', mockHandler);

      await handler.processWebhook(JSON.stringify(sampleDeliveryPayload));

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should throw for invalid JSON', async () => {
      await expect(handler.processWebhook('invalid-json')).rejects.toThrow(
        'Invalid JSON payload'
      );
    });

    it('should throw for missing event', async () => {
      const invalidPayload = { ...sampleDeliveryPayload };
      delete (invalidPayload as Record<string, unknown>).event;

      await expect(handler.processWebhook(invalidPayload)).rejects.toThrow(
        'Webhook payload missing required field: event'
      );
    });

    it('should not call handler for unregistered event', async () => {
      handler.registerHandler('bounce', mockHandler);

      await handler.processWebhook(sampleDeliveryPayload);

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should support on() decorator pattern', async () => {
      const decoratedHandler = handler.on('delivery')(mockHandler);

      await handler.processWebhook(sampleDeliveryPayload);

      expect(mockHandler).toHaveBeenCalled();
      expect(decoratedHandler).toBe(mockHandler);
    });

    it('should remove event handlers', async () => {
      handler.registerHandler('delivery', mockHandler);
      handler.removeHandler('delivery');

      await handler.processWebhook(sampleDeliveryPayload);

      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should get registered event types', () => {
      handler.registerHandler('delivery', mockHandler);
      handler.registerHandler('bounce', mockHandler);

      const eventTypes = handler.getRegisteredEventTypes();

      expect(eventTypes).toContain('delivery');
      expect(eventTypes).toContain('bounce');
      expect(eventTypes).toHaveLength(2);
    });

    it('should manually trigger event handler', async () => {
      handler.registerHandler('delivery', mockHandler);

      const event: WebhookEvent = {
        email: 'manual@example.com',
        event: WebhookEventType.DELIVERY,
        lane_id: 'lane-456',
        message_id: 'msg-456',
        metadata: {},
        tag: 'manual-tag',
        timestamp: 9876543210,
      };

      await handler.handleEvent('delivery', event);

      expect(mockHandler).toHaveBeenCalledWith(event);
    });

    it('should handle async event handlers', async () => {
      const asyncHandler = jest.fn().mockResolvedValue(undefined);
      handler.registerHandler('delivery', asyncHandler);

      await handler.processWebhook(sampleDeliveryPayload);

      expect(asyncHandler).toHaveBeenCalled();
    });

    it('should handle event-specific fields for open events', async () => {
      handler.registerHandler('open', mockHandler);

      await handler.processWebhook(sampleOpenPayload);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'open',
          referer: 'https://example.com/page',
          client_name:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          client_os: 'Windows',
          client_ip: '192.168.1.1',
          client_device: 'Desktop',
        })
      );
    });

    it('should handle event-specific fields for click events', async () => {
      handler.registerHandler('click', mockHandler);

      await handler.processWebhook(sampleClickPayload);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'click',
          url: 'https://example.com/product/123',
          referer: 'https://example.com/newsletter',
          client_os: 'iOS',
          client_device: 'Mobile',
        })
      );
    });

    it('should handle event-specific fields for bounce events', async () => {
      handler.registerHandler('bounce', mockHandler);

      await handler.processWebhook(sampleBouncePayload);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'bounce',
          code: '550',
          extended_code: '5.1.1',
          text: 'The email account that you tried to reach does not exist.',
          is_hard: true,
          deliverability_issue: 'invalid_recipient',
        })
      );
    });

    it('should handle batch mode (array of events)', async () => {
      const batchPayload = [sampleDeliveryPayload, sampleOpenPayload];
      const deliveryHandler = jest.fn();
      const openHandler = jest.fn();

      handler.registerHandler('delivery', deliveryHandler);
      handler.registerHandler('open', openHandler);

      await handler.processWebhook(batchPayload);

      expect(deliveryHandler).toHaveBeenCalledTimes(1);
      expect(openHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle batch mode with JSON string', async () => {
      const batchPayload = [sampleDeliveryPayload, sampleClickPayload];
      const deliveryHandler = jest.fn();
      const clickHandler = jest.fn();

      handler.registerHandler('delivery', deliveryHandler);
      handler.registerHandler('click', clickHandler);

      await handler.processWebhook(JSON.stringify(batchPayload));

      expect(deliveryHandler).toHaveBeenCalledTimes(1);
      expect(clickHandler).toHaveBeenCalledTimes(1);
    });
  });
});
