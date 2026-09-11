/**
 * Response from sending email(s).
 */
export interface SendEmailResponse {
  /** Status of the request, e.g. 'accepted' */
  status: string;
  /** Message IDs when return_message_ids is enabled */
  messageIds?: string[];
  /** First message ID, or the single message_id field when present */
  messageId?: string;
}

/**
 * Parse a send-email API response.
 */
export function sendEmailResponseFromApi(
  data: Record<string, unknown>
): SendEmailResponse {
  const messageIds = Array.isArray(data.message_ids)
    ? (data.message_ids as unknown[]).filter(
        (id): id is string => typeof id === 'string'
      )
    : undefined;

  let messageId =
    typeof data.message_id === 'string' ? data.message_id : undefined;
  if (messageId === undefined && messageIds && messageIds.length > 0) {
    messageId = messageIds[0];
  }

  const response: SendEmailResponse = {
    status: typeof data.status === 'string' ? data.status : 'unknown',
  };
  if (messageIds) {
    response.messageIds = messageIds;
  }
  if (messageId !== undefined) {
    response.messageId = messageId;
  }
  return response;
}
