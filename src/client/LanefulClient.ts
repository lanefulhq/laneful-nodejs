import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  Email,
  EmailResponse,
  EmailResponseList,
  emailToApiFormat,
  validateEmail,
} from '../models';
import {
  LanefulError,
  LanefulAPIError,
  LanefulAuthError,
  LanefulValidationError,
} from '../exceptions';

/**
 * Logger interface for custom logging.
 */
export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, error?: unknown): void;
}

/**
 * Retry configuration options.
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay between retries in milliseconds (default: 1000) */
  baseDelay?: number;
  /** Maximum delay between retries in milliseconds (default: 10000) */
  maxDelay?: number;
  /** Backoff multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Jitter factor to add randomness to delays (default: 0.1) */
  jitter?: number;
}

/**
 * Rate limiting configuration options.
 */
export interface RateLimitOptions {
  /** Maximum number of requests per time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

/**
 * Configuration options for the Laneful client.
 */
export interface LanefulClientOptions {
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Whether to verify SSL certificates (default: true) */
  verifySsl?: boolean;
  /** Custom user agent string */
  userAgent?: string;
  /** Custom logger for debugging and monitoring */
  logger?: Logger;
  /** Retry configuration for failed requests */
  retry?: RetryOptions;
  /** Rate limiting configuration */
  rateLimit?: RateLimitOptions;
}

/**
 * Laneful API client for sending emails.
 *
 * @example
 * ```typescript
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
export class LanefulClient {
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly logger: Logger | undefined;
  private readonly retryOptions: Required<RetryOptions>;
  private readonly rateLimitOptions: RateLimitOptions | undefined;
  private requestCount = 0;
  private windowStart = Date.now();

  /**
   * Initialize the Laneful client.
   *
   * @param baseUrl - The base URL for the Laneful API endpoint
   * @param authToken - Your authentication token
   * @param options - Additional configuration options
   */
  constructor(
    baseUrl: string,
    authToken: string,
    options: LanefulClientOptions = {}
  ) {
    if (!baseUrl || typeof baseUrl !== 'string') {
      throw new LanefulValidationError('Base URL must be a non-empty string');
    }

    if (!authToken || typeof authToken !== 'string') {
      throw new LanefulValidationError('Auth token must be a non-empty string');
    }

    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.logger = options.logger;
    this.rateLimitOptions = options.rateLimit;

    // Set retry defaults
    this.retryOptions = {
      maxRetries: options.retry?.maxRetries ?? 3,
      baseDelay: options.retry?.baseDelay ?? 1000,
      maxDelay: options.retry?.maxDelay ?? 10000,
      backoffMultiplier: options.retry?.backoffMultiplier ?? 2,
      jitter: options.retry?.jitter ?? 0.1,
    };

    const { timeout = 30000, userAgent = 'laneful-nodejs/1.0.0' } = options;

    this.httpClient = axios.create({
      baseURL: `${this.baseUrl}/v1`,
      timeout,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': userAgent,
      },
      // Note: axios doesn't have a direct equivalent to requests' verify_ssl
      // SSL verification is handled by Node.js and can be controlled via environment variables
      validateStatus: () => true, // Don't throw for HTTP error status codes
    });

    this.logger?.debug('Laneful client initialized', {
      baseUrl: this.baseUrl,
      retryOptions: this.retryOptions,
      rateLimit: this.rateLimitOptions,
    });
  }

  /**
   * Send a single email.
   *
   * @param email - Email object to send
   * @returns Promise resolving to EmailResponse with send status and message ID
   * @throws {LanefulError} If sending fails
   */
  async sendEmail(email: Email): Promise<EmailResponse> {
    return this.sendEmails([email]).then((responses) => responses[0]!);
  }

  /**
   * Send multiple emails.
   *
   * @param emails - Array of Email objects to send
   * @returns Promise resolving to array of EmailResponse objects
   * @throws {LanefulError} If sending fails completely (all emails failed)
   */
  async sendEmails(emails: Email[]): Promise<EmailResponseList> {
    this.validateEmailsList(emails);

    const validationErrors: Array<{ index: number; error: string }> = [];
    const validEmailData: Array<{
      data: Record<string, unknown>;
      originalIndex: number;
    }> = [];

    // Validate all emails and collect validation errors
    emails.forEach((email, index) => {
      try {
        validateEmail(email);
        validEmailData.push({
          data: emailToApiFormat(email),
          originalIndex: index,
        });
      } catch (error) {
        validationErrors.push({
          index,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    this.logger?.debug('Email validation completed', {
      totalEmails: emails.length,
      validEmails: validEmailData.length,
      validationErrors: validationErrors.length,
    });

    // If all emails failed validation, throw an error
    if (validEmailData.length === 0) {
      const errorMessage = `All emails failed validation: ${validationErrors
        .map((e) => `[${e.index}] ${e.error}`)
        .join(', ')}`;
      throw new LanefulValidationError(errorMessage);
    }

    let responses: EmailResponseList;

    if (validEmailData.length > 0) {
      try {
        const responseData = await this.makeRequest('POST', '/email/send', {
          emails: validEmailData.map((item) => item.data),
        });

        responses = this.processEmailsResponse(
          responseData,
          validEmailData,
          emails.length
        );
      } catch (error) {
        // If the API call fails completely, create error responses for valid emails
        responses = validEmailData.map((item) => ({
          status: 'failed' as const,
          index: item.originalIndex,
          error: error instanceof Error ? error.message : String(error),
          success: false,
        }));
      }
    } else {
      responses = [];
    }

    // Add validation error responses
    validationErrors.forEach(({ index, error }) => {
      responses.splice(index, 0, {
        status: 'validation_failed' as const,
        index,
        error,
        success: false,
      });
    });

    // Sort responses by index to maintain original order
    responses.sort(
      (a: EmailResponse, b: EmailResponse) => (a.index ?? 0) - (b.index ?? 0)
    );

    this.logger?.info('Bulk email send completed', {
      totalEmails: emails.length,
      successful: responses.filter((r: EmailResponse) => r.success).length,
      failed: responses.filter((r: EmailResponse) => !r.success).length,
    });

    return responses;
  }

  /**
   * Check rate limits before making a request.
   * @throws {LanefulError} If rate limit is exceeded
   */
  private checkRateLimit(): void {
    if (!this.rateLimitOptions) {
      return;
    }

    const now = Date.now();
    const windowElapsed = now - this.windowStart;

    // Reset window if it has elapsed
    if (windowElapsed >= this.rateLimitOptions.windowMs) {
      this.windowStart = now;
      this.requestCount = 0;
    }

    // Check if we've exceeded the rate limit
    if (this.requestCount >= this.rateLimitOptions.maxRequests) {
      const waitTime = this.rateLimitOptions.windowMs - windowElapsed;
      throw new LanefulError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`
      );
    }

    this.requestCount++;
  }

  /**
   * Calculate delay for exponential backoff with jitter.
   */
  private calculateRetryDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.retryOptions.baseDelay *
        Math.pow(this.retryOptions.backoffMultiplier, attempt),
      this.retryOptions.maxDelay
    );

    // Add jitter to prevent thundering herd
    const jitter = exponentialDelay * this.retryOptions.jitter * Math.random();
    return Math.floor(exponentialDelay + jitter);
  }

  /**
   * Determine if an error is retryable.
   */
  private isRetryableError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      // Network errors
      if (
        error.code === 'ECONNABORTED' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT'
      ) {
        return true;
      }

      // Server errors (5xx) except 501 Not Implemented
      if (
        error.response?.status &&
        error.response.status >= 500 &&
        error.response.status !== 501
      ) {
        return true;
      }

      // Rate limit (429)
      if (error.response?.status === 429) {
        return true;
      }
    }

    return false;
  }

  /**
   * Sleep for specified milliseconds.
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Make an HTTP request to the API with retry logic.
   *
   * @param method - HTTP method
   * @param endpoint - API endpoint path
   * @param data - Request data to send as JSON
   * @returns Promise resolving to response data
   * @throws {LanefulAuthError} If authentication fails
   * @throws {LanefulAPIError} If the API returns an error
   * @throws {LanefulError} For other client errors
   */
  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    this.checkRateLimit();

    let lastError: unknown;

    for (let attempt = 0; attempt <= this.retryOptions.maxRetries; attempt++) {
      try {
        this.logger?.debug('Making request', {
          method,
          endpoint,
          attempt: attempt + 1,
          maxRetries: this.retryOptions.maxRetries + 1,
        });

        const response: AxiosResponse = await this.httpClient.request({
          method,
          url: endpoint,
          data,
        });

        this.logger?.debug('Request completed', {
          method,
          endpoint,
          status: response.status,
          attempt: attempt + 1,
        });

        return this.processResponse(response);
      } catch (error) {
        lastError = error;

        this.logger?.warn('Request failed', {
          method,
          endpoint,
          attempt: attempt + 1,
          error: error instanceof Error ? error.message : String(error),
        });

        // Don't retry on the last attempt
        if (attempt === this.retryOptions.maxRetries) {
          break;
        }

        // Don't retry if it's not a retryable error
        if (!this.isRetryableError(error)) {
          break;
        }

        // Calculate and apply delay
        const delay = this.calculateRetryDelay(attempt);
        this.logger?.debug('Retrying after delay', {
          method,
          endpoint,
          delayMs: delay,
          nextAttempt: attempt + 2,
        });

        await this.sleep(delay);
      }
    }

    // Process the final error
    if (axios.isAxiosError(lastError)) {
      if (lastError.code === 'ECONNABORTED') {
        throw new LanefulError('Request timed out');
      }
      if (lastError.code === 'ECONNREFUSED' || lastError.code === 'ENOTFOUND') {
        throw new LanefulError('Failed to connect to Laneful API');
      }
      // If it's an axios error but we got a response, process it
      if (lastError.response) {
        return this.processResponse(lastError.response);
      }
    }

    // Re-throw Laneful errors to preserve their type
    if (lastError instanceof LanefulError) {
      throw lastError;
    }

    throw new LanefulError(
      `Request failed after ${this.retryOptions.maxRetries + 1} attempts: ${lastError}`
    );
  }

  /**
   * Process HTTP response and handle errors.
   *
   * @param response - Axios response object
   * @returns Processed response data
   * @throws {LanefulAuthError} If authentication fails
   * @throws {LanefulAPIError} If the API returns an error
   */
  private processResponse(response: AxiosResponse): Record<string, unknown> {
    const { status: statusCode, data } = response;

    // Parse response data
    let responseData: Record<string, unknown>;
    if (typeof data === 'string') {
      try {
        responseData = JSON.parse(data) as Record<string, unknown>;
      } catch {
        responseData = { message: data };
      }
    } else if (typeof data === 'object' && data !== null) {
      responseData = data as Record<string, unknown>;
    } else {
      responseData = { data };
    }

    // Handle authentication errors (401)
    if (statusCode === 401) {
      throw new LanefulAuthError('Invalid authentication token');
    }

    // Handle API errors (400 and other 4xx/5xx)
    if (statusCode >= 400) {
      // API spec error format: {"error": "Invalid request or unauthorized"}
      const errorMessage =
        (responseData.error as string) ??
        (responseData.message as string) ??
        `HTTP ${statusCode}`;
      throw new LanefulAPIError(errorMessage, statusCode, responseData);
    }

    return responseData;
  }

  /**
   * Process bulk email response.
   *
   * @param responseData - Response data from API
   * @param validEmailData - Array of valid email data with original indices
   * @param totalEmailCount - Total number of emails in the original batch
   * @returns Array of EmailResponse objects
   */
  private processEmailsResponse(
    responseData: Record<string, unknown>,
    validEmailData: Array<{
      data: Record<string, unknown>;
      originalIndex: number;
    }>,
    totalEmailCount: number
  ): EmailResponseList {
    const responses: EmailResponseList = [];

    // Handle API spec response format: {"status": "accepted"}
    if (responseData.status === 'accepted') {
      // Create successful responses for all valid emails
      for (let i = 0; i < validEmailData.length; i++) {
        const emailData = validEmailData[i];
        if (!emailData) continue;

        responses.push({
          status: 'accepted' as const,
          index: emailData.originalIndex,
          error: undefined,
          success: true,
        });
      }
    } else {
      // Handle error response format: {"error": "Invalid request or unauthorized"}
      const errorMessage = (responseData.error as string) || 'Unknown error';

      for (let i = 0; i < validEmailData.length; i++) {
        const emailData = validEmailData[i];
        if (!emailData) continue;

        responses.push({
          status: 'failed' as const,
          index: emailData.originalIndex,
          error: errorMessage,
          success: false,
        });
      }
    }

    this.logger?.debug('Processed bulk email responses', {
      validEmailCount: validEmailData.length,
      totalEmailCount,
      successfulResponses: responses.filter((r: EmailResponse) => r.success)
        .length,
      responseStatus: responseData.status,
    });

    return responses;
  }

  /**
   * Validate that emails list is not empty.
   *
   * @param emails - List of emails to validate
   * @throws {LanefulValidationError} If list is empty
   */
  private validateEmailsList(emails: Email[]): void {
    if (!Array.isArray(emails) || emails.length === 0) {
      throw new LanefulValidationError('Email list cannot be empty');
    }
  }
}
