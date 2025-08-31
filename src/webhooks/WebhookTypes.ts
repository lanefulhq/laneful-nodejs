/**
 * Webhook event types.
 */
export enum WebhookEventType {
  DELIVERY = 'delivery',
  OPEN = 'open',
  CLICK = 'click',
  DROP = 'drop',
  SPAM_COMPLAINT = 'spam_complaint',
  UNSUBSCRIBE = 'unsubscribe',
  BOUNCE = 'bounce',
}

/**
 * Base webhook event interface with common fields.
 */
export interface BaseWebhookEvent {
  email: string;
  event: WebhookEventType;
  lane_id: string;
  message_id: string;
  metadata: Record<string, unknown>;
  tag: string;
  timestamp: number;
}

/**
 * Delivery event - Email successfully delivered.
 */
export interface DeliveryEvent extends BaseWebhookEvent {
  event: WebhookEventType.DELIVERY;
}

/**
 * Open event - Email opened by recipient.
 */
export interface OpenEvent extends BaseWebhookEvent {
  event: WebhookEventType.OPEN;
  referer?: string;
  client_name?: string;
  client_os?: string;
  client_ip?: string;
  client_device?: string;
}

/**
 * Click event - Link clicked in email.
 */
export interface ClickEvent extends BaseWebhookEvent {
  event: WebhookEventType.CLICK;
  url: string;
  referer?: string;
  client_name?: string;
  client_os?: string;
  client_ip?: string;
  client_device?: string;
}

/**
 * Drop event - Email dropped before sending.
 */
export interface DropEvent extends BaseWebhookEvent {
  event: WebhookEventType.DROP;
  reason: string;
}

/**
 * Spam complaint event - Email marked as spam.
 */
export interface SpamComplaintEvent extends BaseWebhookEvent {
  event: WebhookEventType.SPAM_COMPLAINT;
  feedback_type: number;
  feedback_type_text: string;
  received_unix_timestamp: number;
}

/**
 * Unsubscribe event - Recipient unsubscribed.
 */
export interface UnsubscribeEvent extends BaseWebhookEvent {
  event: WebhookEventType.UNSUBSCRIBE;
  unsubscribe_group_id?: number;
}

/**
 * Bounce event - Email bounced back.
 */
export interface BounceEvent extends BaseWebhookEvent {
  event: WebhookEventType.BOUNCE;
  code: string;
  extended_code?: string;
  text: string;
  is_hard: boolean;
  deliverability_issue?: string;
}

/**
 * Union type for all webhook events.
 */
export type WebhookEvent =
  | DeliveryEvent
  | OpenEvent
  | ClickEvent
  | DropEvent
  | SpamComplaintEvent
  | UnsubscribeEvent
  | BounceEvent;

/**
 * Webhook payload can be either a single event or an array of events (batch mode).
 */
export type WebhookPayload = WebhookEvent | WebhookEvent[];

/**
 * Creates a WebhookEvent from webhook payload data.
 */
export function createWebhookEvent(
  data: Record<string, unknown>
): WebhookEvent {
  const baseEvent: BaseWebhookEvent = {
    email: (data.email as string) ?? '',
    event: (data.event as WebhookEventType) ?? ('' as WebhookEventType),
    lane_id: (data.lane_id as string) ?? '',
    message_id: (data.message_id as string) ?? '',
    metadata: (data.metadata as Record<string, unknown>) ?? {},
    tag: (data.tag as string) ?? '',
    timestamp: (data.timestamp as number) ?? 0,
  };

  // Return event with specific type and additional fields
  switch (baseEvent.event) {
    case WebhookEventType.DELIVERY:
      return baseEvent as DeliveryEvent;

    case WebhookEventType.OPEN:
      return {
        ...baseEvent,
        referer: data.referer as string,
        client_name: data.client_name as string,
        client_os: data.client_os as string,
        client_ip: data.client_ip as string,
        client_device: data.client_device as string,
      } as OpenEvent;

    case WebhookEventType.CLICK:
      return {
        ...baseEvent,
        url: (data.url as string) ?? '',
        referer: data.referer as string,
        client_name: data.client_name as string,
        client_os: data.client_os as string,
        client_ip: data.client_ip as string,
        client_device: data.client_device as string,
      } as ClickEvent;

    case WebhookEventType.DROP:
      return {
        ...baseEvent,
        reason: (data.reason as string) ?? '',
      } as DropEvent;

    case WebhookEventType.SPAM_COMPLAINT:
      return {
        ...baseEvent,
        feedback_type: (data.feedback_type as number) ?? 0,
        feedback_type_text: (data.feedback_type_text as string) ?? '',
        received_unix_timestamp: (data.received_unix_timestamp as number) ?? 0,
      } as SpamComplaintEvent;

    case WebhookEventType.UNSUBSCRIBE:
      return {
        ...baseEvent,
        unsubscribe_group_id: data.unsubscribe_group_id as number,
      } as UnsubscribeEvent;

    case WebhookEventType.BOUNCE:
      return {
        ...baseEvent,
        code: (data.code as string) ?? '',
        extended_code: data.extended_code as string,
        text: (data.text as string) ?? '',
        is_hard: (data.is_hard as boolean) ?? false,
        deliverability_issue: data.deliverability_issue as string,
      } as BounceEvent;

    default:
      return baseEvent as WebhookEvent;
  }
}

/**
 * Type for webhook event handler functions.
 */
export type WebhookEventHandler = (event: WebhookEvent) => void | Promise<void>;
