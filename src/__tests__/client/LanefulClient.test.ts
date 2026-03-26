import axios from 'axios';
import { LanefulClient } from '../../client/LanefulClient';
import { Email } from '../../models';
import {
  LanefulValidationError,
  LanefulAPIError,
  LanefulAuthError,
} from '../../exceptions';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LanefulClient', () => {
  const baseUrl = 'https://api.laneful.com';
  const authToken = 'test-token';

  const validEmail: Email = {
    from: { email: 'sender@example.com', name: 'Sender' },
    to: [{ email: 'recipient@example.com', name: 'Recipient' }],
    subject: 'Test Subject',
    textContent: 'Test content',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.create.mockReturnValue(mockedAxios);
  });

  describe('constructor', () => {
    it('should create client with valid parameters', () => {
      expect(() => new LanefulClient(baseUrl, authToken)).not.toThrow();
    });

    it('should throw for empty base URL', () => {
      expect(() => new LanefulClient('', authToken)).toThrow(
        LanefulValidationError
      );
    });

    it('should throw for empty auth token', () => {
      expect(() => new LanefulClient(baseUrl, '')).toThrow(
        LanefulValidationError
      );
    });

    it('should remove trailing slash from base URL', () => {
      new LanefulClient('https://api.laneful.com/', authToken);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.laneful.com/v1',
        })
      );
    });

    it('should set correct headers', () => {
      new LanefulClient(baseUrl, authToken);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      );
    });
  });

  describe('sendEmail', () => {
    let client: LanefulClient;

    beforeEach(() => {
      client = new LanefulClient(baseUrl, authToken);
    });

    it('should send email successfully', async () => {
      const mockResponse = {
        status: 200,
        data: { status: 'accepted' },
      };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const result = await client.sendEmail(validEmail);

      expect(result).toEqual({ status: 'accepted' });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/email/send',
        data: {
          emails: [
            expect.objectContaining({
              from: { email: 'sender@example.com', name: 'Sender' },
              subject: 'Test Subject',
            }),
          ],
        },
      });
    });

    it('should throw on API error', async () => {
      const mockResponse = {
        status: 400,
        data: { error: 'Invalid email' },
      };
      mockedAxios.request.mockResolvedValue(mockResponse);

      await expect(client.sendEmail(validEmail)).rejects.toThrow(
        LanefulAPIError
      );
    });

    it('should throw on authentication error', async () => {
      const mockResponse = {
        status: 401,
        data: { error: 'Unauthorized' },
      };
      mockedAxios.request.mockResolvedValue(mockResponse);

      await expect(client.sendEmail(validEmail)).rejects.toThrow(
        LanefulAuthError
      );
    });

  });

  describe('sendEmails', () => {
    let client: LanefulClient;

    beforeEach(() => {
      client = new LanefulClient(baseUrl, authToken);
    });

    it('should send multiple emails successfully', async () => {
      const mockResponse = {
        status: 200,
        data: { status: 'accepted' },
      };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const emails = [validEmail, { ...validEmail, subject: 'Second Email' }];
      const result = await client.sendEmails(emails);

      expect(result).toEqual({ status: 'accepted' });
    });

    it('should throw for empty email list', async () => {
      await expect(client.sendEmails([])).rejects.toThrow(
        LanefulValidationError
      );
    });
  });
});
