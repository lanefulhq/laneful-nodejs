import { createHmac, timingSafeEqual } from 'crypto';
import {
  WebhookEvent,
  WebhookEventHandler,
  createWebhookEvent,
} from './WebhookTypes';

/**
 * Handler for processing Laneful webhook events.
 *
 * @example
 * ```typescript
 * const handler = new WebhookHandler('your-webhook-secret');
 *
 * handler.on('email.delivered', (event) => {
 *   console.log(`Email ${event.messageId} was delivered to ${event.email}`);
 * });
 *
 * // In your web framework handler:
 * if (handler.verifySignature(requestBody, signatureHeader)) {
 *   await handler.processWebhook(requestBody);
 * }
 * ```
 */
export class WebhookHandler {
  private readonly webhookSecret: string | undefined;
  private readonly handlers = new Map<string, WebhookEventHandler>();

  /**
   * Initialize webhook handler.
   *
   * @param webhookSecret - Secret key for verifying webhook signatures
   */
  constructor(webhookSecret?: string) {
    this.webhookSecret = webhookSecret;
  }

  /**
   * Verify webhook signature to ensure authenticity.
   *
   * @param payload - The raw webhook payload
   * @param signature - The signature header from the webhook request
   * @returns True if signature is valid, false otherwise
   */
  verifySignature(payload: string | Buffer, signature: string): boolean {
    if (!this.webhookSecret) {
      return true; // Skip verification if no secret is configured
    }

    const payloadBuffer = Buffer.isBuffer(payload)
      ? payload
      : Buffer.from(payload, 'utf8');

    // Extract signature from header (format: "sha256=signature")
    const signatureToVerify = signature.startsWith('sha256=')
      ? signature.slice(7)
      : signature;

    // Calculate expected signature
    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(payloadBuffer)
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
    if (signatureToVerify.length !== expectedSignature.length) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(signatureToVerify, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Register an event handler using decorator pattern.
   *
   * @param eventType - The event type to handle (e.g., "email.delivered")
   * @returns Decorator function for method registration
   */
  on(eventType: string): (handler: WebhookEventHandler) => WebhookEventHandler {
    return (handler: WebhookEventHandler): WebhookEventHandler => {
      this.handlers.set(eventType, handler);
      return handler;
    };
  }

  /**
   * Register an event handler function.
   *
   * @param eventType - The event type to handle
   * @param handler - The handler function
   */
  registerHandler(eventType: string, handler: WebhookEventHandler): void {
    this.handlers.set(eventType, handler);
  }

  /**
   * Remove an event handler.
   *
   * @param eventType - The event type to remove handler for
   */
  removeHandler(eventType: string): void {
    this.handlers.delete(eventType);
  }

  /**
   * Get all registered event types.
   *
   * @returns Array of registered event types
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Process a webhook payload and call appropriate handlers.
   * Supports both single events and batch mode (arrays of events).
   *
   * @param payload - The webhook payload (JSON string or object/array)
   * @throws {Error} If payload is invalid or required fields are missing
   */
  async processWebhook(
    payload: string | Record<string, unknown> | Record<string, unknown>[]
  ): Promise<void> {
    let data: Record<string, unknown> | Record<string, unknown>[];

    if (typeof payload === 'string') {
      try {
        data = JSON.parse(payload) as
          | Record<string, unknown>
          | Record<string, unknown>[];
      } catch (error) {
        throw new Error(`Invalid JSON payload: ${error}`);
      }
    } else {
      data = payload;
    }

    // Handle batch mode (array of events)
    if (Array.isArray(data)) {
      await this.processBatchEvents(data);
    } else {
      // Handle single event
      await this.processSingleEvent(data);
    }
  }

  /**
   * Process a batch of webhook events.
   *
   * @param events - Array of event data objects
   */
  private async processBatchEvents(
    events: Record<string, unknown>[]
  ): Promise<void> {
    const promises = events.map((eventData) =>
      this.processSingleEvent(eventData)
    );
    await Promise.all(promises);
  }

  /**
   * Process a single webhook event.
   *
   * @param eventData - Single event data object
   */
  private async processSingleEvent(
    eventData: Record<string, unknown>
  ): Promise<void> {
    const event = createWebhookEvent(eventData);

    // Validate required fields
    if (!event.event) {
      throw new Error('Webhook payload missing required field: event');
    }

    // Call the appropriate handler if one is registered
    const handler = this.handlers.get(event.event);
    if (handler) {
      await handler(event);
    }
  }

  /**
   * Manually trigger an event handler.
   *
   * @param eventType - The event type
   * @param event - The webhook event data
   */
  async handleEvent(eventType: string, event: WebhookEvent): Promise<void> {
    const handler = this.handlers.get(eventType);
    if (handler) {
      await handler(event);
    }
  }
}
