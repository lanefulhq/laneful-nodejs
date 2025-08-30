/**
 * Base exception for all Laneful client errors.
 */
export class LanefulError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LanefulError';
    Object.setPrototypeOf(this, LanefulError.prototype);
  }
}

/**
 * Exception raised for API errors.
 */
export class LanefulAPIError extends LanefulError {
  public readonly statusCode: number | undefined;
  public readonly responseData: Record<string, unknown>;

  constructor(
    message: string,
    statusCode?: number,
    responseData?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'LanefulAPIError';
    this.statusCode = statusCode;
    this.responseData = responseData ?? {};
    Object.setPrototypeOf(this, LanefulAPIError.prototype);
  }
}

/**
 * Exception raised for authentication errors.
 */
export class LanefulAuthError extends LanefulError {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'LanefulAuthError';
    Object.setPrototypeOf(this, LanefulAuthError.prototype);
  }
}

/**
 * Exception raised for validation errors.
 */
export class LanefulValidationError extends LanefulError {
  constructor(message: string) {
    super(message);
    this.name = 'LanefulValidationError';
    Object.setPrototypeOf(this, LanefulValidationError.prototype);
  }
}
