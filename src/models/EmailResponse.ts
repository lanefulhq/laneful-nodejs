/**
 * Response from sending email(s).
 * Matches the SendEmailResponse schema: `{ status: string }`.
 */
export interface SendEmailResponse {
  /** Status of the request, e.g. 'accepted' */
  status: string;
}
