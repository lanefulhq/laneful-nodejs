/**
 * Webhook event types.
 */
export enum WebhookEventType {
  EMAIL_SENT = 'email.sent',
  EMAIL_DELIVERED = 'email.delivered',
  EMAIL_OPENED = 'email.opened',
  EMAIL_CLICKED = 'email.clicked',
  EMAIL_BOUNCED = 'email.bounced',
  EMAIL_COMPLAINED = 'email.complained',
  EMAIL_UNSUBSCRIBED = 'email.unsubscribed',
  EMAIL_FAILED = 'email.failed',
}

/**
 * Webhook event data.
 */
export interface WebhookEvent {
  /** Event type */
  eventType: string;
  /** Message ID */
  messageId: string;
  /** Email address */
  email: string;
  /** Event timestamp (Unix timestamp) */
  timestamp: number;
  /** Additional event data */
  data: Record<string, unknown>;
}

/**
 * Creates a WebhookEvent from webhook payload.
 */
export function createWebhookEvent(
  data: Record<string, unknown>
): WebhookEvent {
  return {
    eventType: (data.event_type as string) ?? '',
    messageId: (data.message_id as string) ?? '',
    email: (data.email as string) ?? '',
    timestamp: (data.timestamp as number) ?? 0,
    data: (data.data as Record<string, unknown>) ?? {},
  };
}

/**
 * Type for webhook event handler functions.
 */
export type WebhookEventHandler = (event: WebhookEvent) => void | Promise<void>;
