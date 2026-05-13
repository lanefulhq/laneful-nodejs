/**
 * Additional settings for sending email.
 */
export interface MailSettings {
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
): Record<string, boolean> {
  const result: Record<string, boolean> = {};

  if (settings.sandboxMode !== undefined) {
    result.sandbox_mode = settings.sandboxMode;
  }

  if (settings.returnMessageIds !== undefined) {
    result.return_message_ids = settings.returnMessageIds;
  }

  return result;
}
