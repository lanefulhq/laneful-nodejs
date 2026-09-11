import { LanefulClient } from 'laneful';

const baseUrl =
  process.env.LANEFUL_ORG_BASE_URL ||
  process.env.LANEFUL_BASE_URL ||
  'https://api.laneful.net';
const authToken = process.env.LANEFUL_AUTH_TOKEN;

if (!authToken) {
  console.error('Missing LANEFUL_AUTH_TOKEN');
  process.exit(1);
}

const client = new LanefulClient(baseUrl, authToken);
const today = new Date();
const start = new Date(today);
start.setDate(today.getDate() - 7);
const iso = (date: Date) => date.toISOString().slice(0, 10);

const radar = await client.listDomainSpamRatioRadar({
  startDate: iso(start),
  endDate: iso(today),
});
for (const entry of radar.radar) {
  console.log(
    `${entry.date} ${entry.domain} @${entry.esp}: ${entry.spamRatio}%`
  );
}

const postmaster = await client.listGooglePostmasterSpamReports({
  domain: 'example.com',
});
for (const report of postmaster.spamReports) {
  console.log(`${report.date} ${report.domain}: ${report.spamRatio}%`);
}

const snds = await client.listSndsReports();
for (const report of snds.sndsReports) {
  console.log(
    `${report.date} ${report.ip}: filter=${report.filterResult} complaint=${report.complaintRate}%`
  );
}
