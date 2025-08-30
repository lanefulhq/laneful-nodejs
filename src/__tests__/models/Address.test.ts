import {
  Address,
  validateAddress,
  addressToApiFormat,
} from '../../models/Address';

describe('Address', () => {
  describe('validateAddress', () => {
    it('should validate a correct email address', () => {
      const address: Address = {
        email: 'test@example.com',
        name: 'Test User',
      };

      expect(() => validateAddress(address)).not.toThrow();
    });

    it('should validate an email without name', () => {
      const address: Address = {
        email: 'test@example.com',
      };

      expect(() => validateAddress(address)).not.toThrow();
    });

    it('should throw for invalid email', () => {
      const address: Address = {
        email: 'invalid-email',
        name: 'Test User',
      };

      expect(() => validateAddress(address)).toThrow('Invalid email format');
    });

    it('should throw for empty email', () => {
      const address: Address = {
        email: '',
        name: 'Test User',
      };

      expect(() => validateAddress(address)).toThrow(
        'Address must have a valid email string'
      );
    });

    it('should throw for non-string email', () => {
      const address = {
        email: 123,
        name: 'Test User',
      } as unknown as Address;

      expect(() => validateAddress(address)).toThrow(
        'Address must have a valid email string'
      );
    });
  });

  describe('addressToApiFormat', () => {
    it('should convert address with name to API format', () => {
      const address: Address = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = addressToApiFormat(address);

      expect(result).toEqual({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should convert address without name to API format', () => {
      const address: Address = {
        email: 'test@example.com',
      };

      const result = addressToApiFormat(address);

      expect(result).toEqual({
        email: 'test@example.com',
      });
    });

    it('should not include empty name in API format', () => {
      const address: Address = {
        email: 'test@example.com',
        name: '',
      };

      const result = addressToApiFormat(address);

      expect(result).toEqual({
        email: 'test@example.com',
      });
    });
  });
});
