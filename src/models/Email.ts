import { Address, addressToApiFormat, validateAddress } from './Address';
import {
  Attachment,
  attachmentToApiFormat,
  validateAttachment,
} from './Attachment';
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
 * Validates an email object.
 */
export function validateEmail(email: Email): void {
  // Validate from address
  if (!email.from) {
    throw new Error('Email must have a from address');
  }
  validateAddress(email.from);

  // Validate subject
  if (!email.subject || typeof email.subject !== 'string') {
    throw new Error('Email must have a valid subject string');
  }

  // Validate content
  if (!email.textContent && !email.htmlContent && !email.templateId) {
    throw new Error(
      'Email must have either textContent, htmlContent, or templateId'
    );
  }

  // Validate recipients
  const hasRecipients =
    (email.to && email.to.length > 0) ||
    (email.cc && email.cc.length > 0) ||
    (email.bcc && email.bcc.length > 0);

  if (!hasRecipients) {
    throw new Error('Email must have at least one recipient (to, cc, or bcc)');
  }

  // Validate all addresses
  if (email.to) {
    email.to.forEach((addr, index) => {
      try {
        validateAddress(addr);
      } catch (error) {
        throw new Error(`Invalid 'to' address at index ${index}: ${error}`);
      }
    });
  }

  if (email.cc) {
    email.cc.forEach((addr, index) => {
      try {
        validateAddress(addr);
      } catch (error) {
        throw new Error(`Invalid 'cc' address at index ${index}: ${error}`);
      }
    });
  }

  if (email.bcc) {
    email.bcc.forEach((addr, index) => {
      try {
        validateAddress(addr);
      } catch (error) {
        throw new Error(`Invalid 'bcc' address at index ${index}: ${error}`);
      }
    });
  }

  if (email.replyTo) {
    try {
      validateAddress(email.replyTo);
    } catch (error) {
      throw new Error(`Invalid 'replyTo' address: ${error}`);
    }
  }

  // Validate attachments
  if (email.attachments) {
    email.attachments.forEach((attachment, index) => {
      try {
        validateAttachment(attachment);
      } catch (error) {
        throw new Error(`Invalid attachment at index ${index}: ${error}`);
      }
    });
  }
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
