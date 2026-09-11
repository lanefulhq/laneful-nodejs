import {
  createDomainRequestToApi,
  domainFromApi,
  listDomainSpamRatioRadarParamsToQuery,
  listDomainsParamsToQuery,
  updateDomainRequestToApi,
} from '../../models/org';

describe('organization models', () => {
  it('omits, clears, or sets emailTrackId on update', () => {
    expect(updateDomainRequestToApi({})).toEqual({});
    expect(updateDomainRequestToApi({ emailTrackId: '' })).toEqual({
      email_track_id: '',
    });
    expect(updateDomainRequestToApi({ emailTrackId: 'track-id' })).toEqual({
      email_track_id: 'track-id',
    });
  });

  it('omits empty emailTrackId on create', () => {
    expect(
      createDomainRequestToApi({
        domain: 'example.com',
        tracking: 'tracking',
        returnPath: 'return-path',
        requireTls: true,
      })
    ).toEqual({
      domain: 'example.com',
      tracking: 'tracking',
      return_path: 'return-path',
      require_tls: true,
    });
  });

  it('uses filter[domain] on domain list queries', () => {
    expect(
      listDomainsParamsToQuery({
        cursor: 'abc',
        limit: 10,
        filterDomain: 'ex.com',
      })
    ).toEqual([
      ['cursor', 'abc'],
      ['limit', '10'],
      ['filter[domain]', 'ex.com'],
    ]);
  });

  it('repeats workspace_ids on radar queries', () => {
    const query = listDomainSpamRatioRadarParamsToQuery({
      workspaceIds: [1, 2],
      domain: 'example.com',
      startDate: '2026-09-01',
      endDate: '2026-09-08',
    });

    expect(query.slice(0, 2)).toEqual([
      ['workspace_ids', '1'],
      ['workspace_ids', '2'],
    ]);
    expect(query).toContainEqual(['domain', 'example.com']);
  });

  it('unwraps a nested domain payload', () => {
    const domain = domainFromApi({
      domain: { domain: 'example.com', verified: true },
    });
    expect(domain.domain).toBe('example.com');
    expect(domain.verified).toBe(true);
  });
});
