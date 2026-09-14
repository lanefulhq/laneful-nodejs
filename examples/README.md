# Laneful Node.js examples

Copy `env.example` to `.env` and fill in your values.

Email sending uses a send host (`LANEFUL_BASE_URL`). Domain, unsubscribe-group,
and analytics examples use the organization API host
(`LANEFUL_ORG_BASE_URL`, default `https://api.laneful.net`; development is
`https://api.dev.laneful.net`).

## Run locally

```bash
cp env.example .env
# edit .env

npx ts-node mailSettings.ts
npx ts-node domains.ts
npx ts-node unsubscribeGroups.ts
npx ts-node analytics.ts
```

## Examples

| Script | Description |
|--------|-------------|
| `simpleEmail.ts` | Basic send and error handling |
| `templateEmail.ts` | Template email |
| `attachmentEmail.ts` | Email with an attachment |
| `trackingEmail.ts` | Tracking and webhook data |
| `scheduledEmail.ts` | Scheduled send |
| `webhookHandling.ts` | Webhook signature verification |
| `mailSettings.ts` | Sandbox send with `fromHeader`, tracking, and mail settings |
| `domains.ts` | List, create, verify, and update sending domains |
| `unsubscribeGroups.ts` | Create, update, and list unsubscribe groups |
| `analytics.ts` | Spam-ratio radar, Google Postmaster, and Microsoft SNDS |

## Environment variables

| Variable | Description |
|----------|-------------|
| `LANEFUL_BASE_URL` | Send host (`https://your-subdomain.z1.send.dev.laneful.net`) |
| `LANEFUL_AUTH_TOKEN` | Auth token (send token for mail examples, org token for org APIs) |
| `LANEFUL_FROM_EMAIL` | Verified sender address |
| `LANEFUL_TO_EMAILS` | Comma-separated recipients |
| `LANEFUL_ORG_BASE_URL` | Organization API host (`https://api.laneful.net`) |
| `LANEFUL_WORKSPACE_ID` | Workspace ID for org API examples |
