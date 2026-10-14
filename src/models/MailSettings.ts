/**
 * Additional settings for sending email.
 */
export interface MailSettings {
  /**
   * Key for duplicate send protection, 1 to 36 bytes. Laneful accepts a key once per
   * organization for one hour: a repeated request with the same key is answered with
   * status 'accepted' (and no message IDs) and sends nothing. The client generates a
   * random key for every send call when none is given, and reuses it on retries.
   */
  idempotencyKey?: string;
  /** When enabled, messages are not persisted or sent. */
  sandboxMode?: boolean;
  /** When enabled, the API response includes message IDs for each email sent. */
  returnMessageIds?: boolean;
}

/**
 * Converts MailSettings to API request format.
 */
export function mailSettingsToApiFormat(
  settings: MailSettings
): Record<string, boolean | string> {
  const result: Record<string, boolean | string> = {};

  if (settings.idempotencyKey !== undefined) {
    result.idempotency_key = settings.idempotencyKey;
  }

  if (settings.sandboxMode !== undefined) {
    result.sandbox_mode = settings.sandboxMode;
  }

  if (settings.returnMessageIds !== undefined) {
    result.return_message_ids = settings.returnMessageIds;
  }

  return result;
}
