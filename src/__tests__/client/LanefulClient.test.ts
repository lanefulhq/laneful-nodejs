import axios from 'axios';
import { LanefulClient } from '../../client/LanefulClient';
import { Email } from '../../models';
import {
  LanefulValidationError,
  LanefulAPIError,
  LanefulAuthError,
} from '../../exceptions';
import { VERSION } from '../../version';

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
            'User-Agent': `laneful-nodejs/${VERSION}`,
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

    it('should send email with mail settings', async () => {
      const mockResponse = {
        status: 200,
        data: { status: 'accepted' },
      };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const result = await client.sendEmail(validEmail, {
        sandboxMode: true,
        returnMessageIds: true,
      });

      expect(result).toEqual({ status: 'accepted' });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/email/send',
        data: expect.objectContaining({
          mail_settings: {
            sandbox_mode: true,
            return_message_ids: true,
          },
        }),
      });
    });

    it('should parse message_ids from the send response', async () => {
      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: { status: 'accepted', message_ids: ['msg_123', 'msg_124'] },
      });

      const result = await client.sendEmail(validEmail, {
        returnMessageIds: true,
      });

      expect(result).toEqual({
        status: 'accepted',
        messageIds: ['msg_123', 'msg_124'],
        messageId: 'msg_123',
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

    it('should send multiple emails with mail settings', async () => {
      const mockResponse = {
        status: 200,
        data: { status: 'accepted' },
      };
      mockedAxios.request.mockResolvedValue(mockResponse);

      const emails = [validEmail, { ...validEmail, subject: 'Second Email' }];
      const result = await client.sendEmails(emails, {
        sandboxMode: true,
        returnMessageIds: false,
      });

      expect(result).toEqual({ status: 'accepted' });

      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/email/send',
        data: expect.objectContaining({
          mail_settings: {
            sandbox_mode: true,
            return_message_ids: false,
          },
        }),
      });
    });

    it('should throw for empty email list', async () => {
      await expect(client.sendEmails([])).rejects.toThrow(
        LanefulValidationError
      );
    });
  });

  describe('organization APIs', () => {
    let client: LanefulClient;

    beforeEach(() => {
      client = new LanefulClient(baseUrl, authToken);
    });

    it('should list unsubscribe groups', async () => {
      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: {
          unsubscribe_groups: [
            { unsubscribe_group_id: 9, name: 'Newsletters', created_at: 1 },
          ],
        },
      });

      const result = await client.listUnsubscribeGroups(42);

      expect(result.unsubscribeGroups[0]).toEqual({
        unsubscribeGroupId: 9,
        name: 'Newsletters',
        createdAt: 1,
      });
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/workspaces/42/unsubscribe-groups',
      });
    });

    it('should create and update unsubscribe groups', async () => {
      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: {
          unsubscribe_group: { unsubscribe_group_id: 9, name: 'Newsletters' },
        },
      });

      const created = await client.createUnsubscribeGroup(42, 'Newsletters');
      expect(created.unsubscribeGroupId).toBe(9);
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/workspaces/42/unsubscribe-groups',
        data: { name: 'Newsletters' },
      });

      mockedAxios.request.mockResolvedValueOnce({
        status: 200,
        data: { unsubscribe_group_id: 9, name: 'Weekly' },
      });

      const updated = await client.updateUnsubscribeGroup(42, 9, 'Weekly');
      expect(updated.name).toBe('Weekly');
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: '/workspaces/42/unsubscribe-groups/9',
        data: { name: 'Weekly' },
      });
    });

    it('should list domains with filter[domain]', async () => {
      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: {
          domains: [{ domain: 'example.com', verified: true }],
          pagination: { next_cursor: 'next' },
        },
      });

      const result = await client.listDomains(42, {
        limit: 25,
        filterDomain: 'example.com',
      });

      expect(result.domains[0]?.domain).toBe('example.com');
      expect(result.nextCursor).toBe('next');

      const call = mockedAxios.request.mock.calls[0]?.[0];
      expect(call?.method).toBe('GET');
      expect(call?.url).toBe('/workspaces/42/domains');
      expect(call?.params.toString()).toBe(
        'limit=25&filter%5Bdomain%5D=example.com'
      );
    });

    it('should get, create, update, verify, and delete a domain', async () => {
      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: { domain: { domain: 'example.com', verified: true } },
      });

      const domain = await client.getDomain(42, 'example.com');
      expect(domain.domain).toBe('example.com');
      expect(domain.verified).toBe(true);
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'GET',
        url: '/workspaces/42/domains/example.com',
      });

      await client.createDomain(42, {
        domain: 'example.com',
        tracking: 't',
        returnPath: 'rp',
      });
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/workspaces/42/domains',
        data: {
          domain: 'example.com',
          tracking: 't',
          return_path: 'rp',
        },
      });

      await client.updateDomain(42, 'example.com', { emailTrackId: '' });
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: '/workspaces/42/domains/example.com',
        data: { email_track_id: '' },
      });

      await client.verifyDomain(42, 'example.com');
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/workspaces/42/domains/example.com/verify',
      });

      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: { message: 'deleted' },
      });
      const deleted = await client.deleteDomain(42, 'example.com');
      expect(deleted.message).toBe('deleted');
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/workspaces/42/domains/example.com',
      });
    });

    it('should repeat workspace_ids on analytics radar', async () => {
      mockedAxios.request.mockResolvedValue({
        status: 200,
        data: { radar: [] },
      });

      await client.listDomainSpamRatioRadar({ workspaceIds: [1, 2] });

      const call = mockedAxios.request.mock.calls[0]?.[0];
      expect(call?.method).toBe('GET');
      expect(call?.url).toBe('/analytics/radar/domain-spam-ratio');
      expect(call?.params.toString()).toBe('workspace_ids=1&workspace_ids=2');
    });
  });
});
