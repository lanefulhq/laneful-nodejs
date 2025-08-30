/**
 * Response from sending an email.
 */
export interface EmailResponse {
  /** Status of the email send operation - 'accepted' for success, 'failed' for failure, 'validation_failed' for validation errors */
  status: 'accepted' | 'failed' | 'validation_failed';
  /** Index of the email in the batch (for bulk operations) */
  index: number | undefined;
  /** Error message if the email failed to send */
  error: string | undefined;
  /** Whether this email was successfully sent */
  success: boolean;
}

/**
 * Type alias for a list of email responses.
 */
export type EmailResponseList = EmailResponse[];
