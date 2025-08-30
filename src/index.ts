/**
 * Laneful TypeScript Client Library
 *
 * A TypeScript/JavaScript client library for the Laneful API.
 *
 * @example
 * ```typescript
 * import { LanefulClient, Address, Email } from 'laneful';
 *
 * const client = new LanefulClient(
 *   'https://custom-endpoint.send.laneful.net',
 *   'your-auth-token'
 * );
 *
 * const email: Email = {
 *   from: { email: 'sender@example.com', name: 'Your Name' },
 *   to: [{ email: 'recipient@example.com', name: 'Recipient Name' }],
 *   subject: 'Hello from Laneful',
 *   textContent: 'This is a test email.',
 *   htmlContent: '<h1>This is a test email.</h1>',
 * };
 *
 * const response = await client.sendEmail(email);
 * console.log(`Email sent successfully: ${response.status}`);
 * ```
 */

// Export main client
export * from './client';

// Export all models and types
export * from './models';

// Export webhook functionality
export * from './webhooks';

// Export exceptions
export * from './exceptions';

// Package version
export const VERSION = '1.0.0';
