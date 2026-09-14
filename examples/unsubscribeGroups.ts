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
const created = await client.createUnsubscribeGroup(workspaceId, 'Newsletters');
console.log(`Created group ${created.unsubscribeGroupId}: ${created.name}`);

const updated = await client.updateUnsubscribeGroup(
  workspaceId,
  created.unsubscribeGroupId,
  'Weekly Newsletters'
);
console.log(`Updated name: ${updated.name}`);

const listing = await client.listUnsubscribeGroups(workspaceId, { limit: 50 });
for (const group of listing.unsubscribeGroups) {
  console.log(`- ${group.unsubscribeGroupId} ${group.name}`);
}
