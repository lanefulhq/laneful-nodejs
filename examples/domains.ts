import { LanefulClient } from 'laneful';

const baseUrl =
  process.env.LANEFUL_ORG_BASE_URL ||
  process.env.LANEFUL_BASE_URL ||
  'https://api.laneful.net';
const authToken = process.env.LANEFUL_AUTH_TOKEN;
const workspaceId = Number(process.env.LANEFUL_WORKSPACE_ID || '1');

if (!authToken) {
  console.error('Missing LANEFUL_AUTH_TOKEN');
  process.exit(1);
}

const client = new LanefulClient(baseUrl, authToken);
const listing = await client.listDomains(workspaceId, { limit: 50 });
console.log(`Domains: ${listing.domains.length}`);

const domain = await client.createDomain(workspaceId, {
  domain: 'mydomain.com',
  tracking: 'tracking',
  returnPath: 'return-path',
});
console.log(`Created ${domain.domain}, verified=${domain.verified}`);

const verified = await client.verifyDomain(workspaceId, 'mydomain.com');
console.log(`Verification: dmarc=${verified.dmarcVerified}`);

const updated = await client.updateDomain(workspaceId, 'mydomain.com', {
  emailTrackId: 'e59f0a35-05bc-4516-b585-c06f69c3e67e',
});
console.log(`Email track: ${updated.emailTrackId}`);
