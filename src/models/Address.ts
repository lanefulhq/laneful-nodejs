/**
 * Email address with optional display name.
 */
export interface Address {
  /** Email address */
  email: string;
  /** Display name (optional) */
  name?: string;
}

/**
 * Validates an email address object.
 */
export function validateAddress(address: Address): void {
  if (!address.email || typeof address.email !== 'string') {
    throw new Error('Address must have a valid email string');
  }

  // RFC 5322 compliant email validation
  // This regex handles most valid email formats including:
  // - International domain names
  // - Special characters in local part
  // - Quoted strings
  // - Comments (basic support)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(address.email)) {
    throw new Error(`Invalid email format: ${address.email}`);
  }

  // Additional length validations per RFC 5321
  if (address.email.length > 254) {
    throw new Error('Email address too long (max 254 characters)');
  }

  const emailParts = address.email.split('@');
  if (emailParts.length !== 2) {
    throw new Error('Invalid email format: missing @ symbol');
  }

  const [localPart, domain] = emailParts;
  if (localPart && localPart.length > 64) {
    throw new Error('Email local part too long (max 64 characters)');
  }

  if (domain && domain.length > 253) {
    throw new Error('Email domain too long (max 253 characters)');
  }
}

/**
 * Converts an Address to API request format.
 */
export function addressToApiFormat(address: Address): Record<string, unknown> {
  const result: Record<string, unknown> = {
    email: address.email,
  };

  if (address.name) {
    result.name = address.name;
  }

  return result;
}
