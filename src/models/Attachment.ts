/**
 * Email attachment.
 */
export interface Attachment {
  /** MIME content type */
  contentType: string;
  /** File name (optional) */
  fileName?: string;
  /** Base64 encoded content */
  content?: string;
  /** Inline content ID for embedding in HTML (optional) */
  inlineId?: string;
}

/**
 * Validates an attachment object.
 */
export function validateAttachment(attachment: Attachment): void {
  if (!attachment.contentType || typeof attachment.contentType !== 'string') {
    throw new Error('Attachment must have a valid contentType string');
  }

  if (!attachment.fileName && !attachment.inlineId) {
    throw new Error('Either fileName or inlineId is required for attachments');
  }
}

/**
 * Converts an Attachment to API request format.
 */
export function attachmentToApiFormat(
  attachment: Attachment
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    content_type: attachment.contentType,
  };

  if (attachment.fileName) {
    result.file_name = attachment.fileName;
  }

  if (attachment.content) {
    result.content = attachment.content;
  }

  if (attachment.inlineId) {
    result.inline_id = attachment.inlineId;
  }

  return result;
}
