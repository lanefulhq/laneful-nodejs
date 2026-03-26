import { Address, addressToApiFormat } from './Address';
import { Attachment, attachmentToApiFormat } from './Attachment';
import {
  TrackingSettings,
  trackingSettingsToApiFormat,
} from './TrackingSettings';

/**
 * Email message data.
 */
export interface Email {
  /** Sender address */
  from: Address;
  /** Email subject */
  subject: string;
  /** Recipients */
  to?: Address[];
  /** CC recipients */
  cc?: Address[];
  /** BCC recipients */
  bcc?: Address[];
  /** Plain text content */
  textContent?: string;
  /** HTML content */
  htmlContent?: string;
  /** Template ID for template-based emails */
  templateId?: string;
  /** Template data for template-based emails */
  templateData?: Record<string, unknown>;
  /** Email attachments */
  attachments?: Attachment[];
  /** Custom headers */
  headers?: Record<string, string>;
  /** Reply-to address */
  replyTo?: Address;
  /** Send time (Unix timestamp, 0 for immediate) */
  sendTime?: number;
  /** Custom webhook data */
  webhookData?: Record<string, string>;
  /** Email tag for categorization */
  tag?: string;
  /** Tracking settings */
  tracking?: TrackingSettings;
}

/**
 * Converts an Email to API request format.
 */
export function emailToApiFormat(email: Email): Record<string, unknown> {
  const result: Record<string, unknown> = {
    from: addressToApiFormat(email.from),
    subject: email.subject,
    to: email.to?.map(addressToApiFormat) ?? [],
    cc: email.cc?.map(addressToApiFormat) ?? [],
    bcc: email.bcc?.map(addressToApiFormat) ?? [],
    text_content: email.textContent ?? '',
    html_content: email.htmlContent ?? '',
    template_id: email.templateId ?? '',
    template_data: email.templateData ?? {},
    attachments: email.attachments?.map(attachmentToApiFormat) ?? [],
    headers: email.headers ?? {},
    send_time: email.sendTime ?? 0,
    webhook_data: email.webhookData ?? {},
    tag: email.tag ?? '',
  };

  if (email.replyTo) {
    result.reply_to = addressToApiFormat(email.replyTo);
  }

  if (email.tracking) {
    result.tracking = trackingSettingsToApiFormat(email.tracking);
  }

  return result;
}
