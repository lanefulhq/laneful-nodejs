/** Query string items (repeated keys supported). */
export type QueryItems = Array<[string, string]>;

function queryValue(key: string, value?: string | number | null): QueryItems {
  if (value === undefined || value === null || value === '') {
    return [];
  }
  return [[key, String(value)]];
}

function queryLimit(limit?: number): QueryItems {
  if (limit !== undefined && limit > 0) {
    return [['limit', String(limit)]];
  }
  return [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

export interface UnsubscribeGroup {
  unsubscribeGroupId: number;
  name: string;
  createdAt: number;
}

export function unsubscribeGroupFromApi(
  data: Record<string, unknown>
): UnsubscribeGroup {
  return {
    unsubscribeGroupId: asNumber(data.unsubscribe_group_id),
    name: asString(data.name),
    createdAt: asNumber(data.created_at),
  };
}

export function parseUnsubscribeGroup(
  data: Record<string, unknown>
): UnsubscribeGroup {
  const payload = data.unsubscribe_group;
  if (payload && typeof payload === 'object') {
    return unsubscribeGroupFromApi(payload as Record<string, unknown>);
  }
  return unsubscribeGroupFromApi(data);
}

export interface ListUnsubscribeGroupsResponse {
  unsubscribeGroups: UnsubscribeGroup[];
  nextCursor?: string;
}

export function listUnsubscribeGroupsResponseFromApi(
  data: Record<string, unknown>
): ListUnsubscribeGroupsResponse {
  const groups = Array.isArray(data.unsubscribe_groups)
    ? data.unsubscribe_groups.map((item) =>
        unsubscribeGroupFromApi(asRecord(item))
      )
    : [];
  const response: ListUnsubscribeGroupsResponse = {
    unsubscribeGroups: groups,
  };
  if (typeof data.next_cursor === 'string') {
    response.nextCursor = data.next_cursor;
  }
  return response;
}

export interface ListUnsubscribeGroupsParams {
  cursor?: string;
  limit?: number;
  search?: string;
}

export function listUnsubscribeGroupsParamsToQuery(
  params: ListUnsubscribeGroupsParams
): QueryItems {
  return [
    ...queryValue('cursor', params.cursor),
    ...queryLimit(params.limit),
    ...queryValue('search', params.search),
  ];
}

export interface Domain {
  domain: string;
  tracking: string;
  returnPath: string;
  verified: boolean;
  trackingVerified: boolean;
  returnPathVerified: boolean;
  dkim1Verified: boolean;
  dkim2Verified: boolean;
  dmarcVerified: boolean;
  requireTls: boolean;
  emailTrackId: string;
}

export function domainFromApi(data: Record<string, unknown>): Domain {
  const payload =
    data.domain && typeof data.domain === 'object'
      ? (data.domain as Record<string, unknown>)
      : data;
  return {
    domain: asString(payload.domain),
    tracking: asString(payload.tracking),
    returnPath: asString(payload.return_path),
    verified: asBoolean(payload.verified),
    trackingVerified: asBoolean(payload.tracking_verified),
    returnPathVerified: asBoolean(payload.return_path_verified),
    dkim1Verified: asBoolean(payload.dkim1_verified),
    dkim2Verified: asBoolean(payload.dkim2_verified),
    dmarcVerified: asBoolean(payload.dmarc_verified),
    requireTls: asBoolean(payload.require_tls),
    emailTrackId: asString(payload.email_track_id),
  };
}

export interface ListDomainsResponse {
  domains: Domain[];
  nextCursor?: string;
}

export function listDomainsResponseFromApi(
  data: Record<string, unknown>
): ListDomainsResponse {
  const pagination = asRecord(data.pagination);
  const response: ListDomainsResponse = {
    domains: Array.isArray(data.domains)
      ? data.domains.map((item) => domainFromApi(asRecord(item)))
      : [],
  };
  if (typeof pagination.next_cursor === 'string') {
    response.nextCursor = pagination.next_cursor;
  }
  return response;
}

export interface ListDomainsParams {
  cursor?: string;
  limit?: number;
  filterDomain?: string;
}

export function listDomainsParamsToQuery(
  params: ListDomainsParams
): QueryItems {
  return [
    ...queryValue('cursor', params.cursor),
    ...queryLimit(params.limit),
    ...queryValue('filter[domain]', params.filterDomain),
  ];
}

export interface CreateDomainRequest {
  domain: string;
  tracking: string;
  returnPath: string;
  requireTls?: boolean;
  emailTrackId?: string;
}

export function createDomainRequestToApi(
  request: CreateDomainRequest
): Record<string, unknown> {
  const result: Record<string, unknown> = {
    domain: request.domain,
    tracking: request.tracking,
    return_path: request.returnPath,
  };
  if (request.requireTls !== undefined) {
    result.require_tls = request.requireTls;
  }
  if (request.emailTrackId) {
    result.email_track_id = request.emailTrackId;
  }
  return result;
}

/**
 * Update a domain's email track.
 * Omit emailTrackId to leave it unchanged, pass "" to clear it, or a UUID to set it.
 */
export interface UpdateDomainRequest {
  emailTrackId?: string;
}

export function updateDomainRequestToApi(
  request: UpdateDomainRequest
): Record<string, unknown> {
  if (request.emailTrackId === undefined) {
    return {};
  }
  return { email_track_id: request.emailTrackId };
}

export interface SuccessResponse {
  message: string;
}

export function successResponseFromApi(
  data: Record<string, unknown>
): SuccessResponse {
  return { message: asString(data.message) };
}

export interface DomainSpamRatioRadar {
  workspaceId: number;
  domain: string;
  esp: string;
  spamRatio: number;
  date: string;
}

export function domainSpamRatioRadarFromApi(
  data: Record<string, unknown>
): DomainSpamRatioRadar {
  return {
    workspaceId: asNumber(data.workspace_id),
    domain: asString(data.domain),
    esp: asString(data.esp),
    spamRatio: asNumber(data.spam_ratio),
    date: asString(data.date),
  };
}

export interface ListDomainSpamRatioRadarResponse {
  radar: DomainSpamRatioRadar[];
  nextCursor?: string;
}

export function listDomainSpamRatioRadarResponseFromApi(
  data: Record<string, unknown>
): ListDomainSpamRatioRadarResponse {
  const response: ListDomainSpamRatioRadarResponse = {
    radar: Array.isArray(data.radar)
      ? data.radar.map((item) => domainSpamRatioRadarFromApi(asRecord(item)))
      : [],
  };
  if (typeof data.next_cursor === 'string') {
    response.nextCursor = data.next_cursor;
  }
  return response;
}

export interface ListDomainSpamRatioRadarParams {
  workspaceIds?: number[];
  domain?: string;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
}

export function listDomainSpamRatioRadarParamsToQuery(
  params: ListDomainSpamRatioRadarParams
): QueryItems {
  return [
    ...(params.workspaceIds ?? []).map((id): [string, string] => [
      'workspace_ids',
      String(id),
    ]),
    ...queryValue('domain', params.domain),
    ...queryValue('start_date', params.startDate),
    ...queryValue('end_date', params.endDate),
    ...queryValue('cursor', params.cursor),
    ...queryLimit(params.limit),
  ];
}

export interface GooglePostmasterSpamReport {
  workspaceId: number;
  domain: string;
  date: string;
  spamRatio: number;
}

export function googlePostmasterSpamReportFromApi(
  data: Record<string, unknown>
): GooglePostmasterSpamReport {
  return {
    workspaceId: asNumber(data.workspace_id),
    domain: asString(data.domain),
    date: asString(data.date),
    spamRatio: asNumber(data.spam_ratio),
  };
}

export interface ListGooglePostmasterSpamReportsResponse {
  spamReports: GooglePostmasterSpamReport[];
  nextCursor?: string;
}

export function listGooglePostmasterSpamReportsResponseFromApi(
  data: Record<string, unknown>
): ListGooglePostmasterSpamReportsResponse {
  const response: ListGooglePostmasterSpamReportsResponse = {
    spamReports: Array.isArray(data.spam_reports)
      ? data.spam_reports.map((item) =>
          googlePostmasterSpamReportFromApi(asRecord(item))
        )
      : [],
  };
  if (typeof data.next_cursor === 'string') {
    response.nextCursor = data.next_cursor;
  }
  return response;
}

export interface ListGooglePostmasterSpamReportsParams {
  workspaceIds?: number[];
  domain?: string;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
}

export function listGooglePostmasterSpamReportsParamsToQuery(
  params: ListGooglePostmasterSpamReportsParams
): QueryItems {
  return [
    ...(params.workspaceIds ?? []).map((id): [string, string] => [
      'workspace_ids',
      String(id),
    ]),
    ...queryValue('domain', params.domain),
    ...queryValue('start_date', params.startDate),
    ...queryValue('end_date', params.endDate),
    ...queryValue('cursor', params.cursor),
    ...queryLimit(params.limit),
  ];
}

export const SNDS_FILTER_UNKNOWN = '';
export const SNDS_FILTER_GREEN = 'GREEN';
export const SNDS_FILTER_YELLOW = 'YELLOW';
export const SNDS_FILTER_RED = 'RED';

export interface SndsReport {
  ip: string;
  date: string;
  rcptCommands: number;
  dataCommands: number;
  messageRecipients: number;
  filterResult: string;
  complaintRate: number;
  trapHits: number;
}

export function sndsReportFromApi(data: Record<string, unknown>): SndsReport {
  return {
    ip: asString(data.ip),
    date: asString(data.date),
    rcptCommands: asNumber(data.rcpt_commands),
    dataCommands: asNumber(data.data_commands),
    messageRecipients: asNumber(data.message_recipients),
    filterResult: asString(data.filter_result) || SNDS_FILTER_UNKNOWN,
    complaintRate: asNumber(data.complaint_rate),
    trapHits: asNumber(data.trap_hits),
  };
}

export interface ListSndsReportsResponse {
  sndsReports: SndsReport[];
  nextCursor?: string;
}

export function listSndsReportsResponseFromApi(
  data: Record<string, unknown>
): ListSndsReportsResponse {
  const response: ListSndsReportsResponse = {
    sndsReports: Array.isArray(data.snds_reports)
      ? data.snds_reports.map((item) => sndsReportFromApi(asRecord(item)))
      : [],
  };
  if (typeof data.next_cursor === 'string') {
    response.nextCursor = data.next_cursor;
  }
  return response;
}

export interface ListSndsReportsParams {
  ip?: string;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
}

export function listSndsReportsParamsToQuery(
  params: ListSndsReportsParams
): QueryItems {
  return [
    ...queryValue('ip', params.ip),
    ...queryValue('start_date', params.startDate),
    ...queryValue('end_date', params.endDate),
    ...queryValue('cursor', params.cursor),
    ...queryLimit(params.limit),
  ];
}
