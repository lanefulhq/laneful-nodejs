import { LanefulClient, Email } from 'laneful';

const baseUrl = process.env.LANEFUL_BASE_URL;
const authToken = process.env.LANEFUL_AUTH_TOKEN;
const fromEmail = process.env.LANEFUL_FROM_EMAIL;
const toEmails = process.env.LANEFUL_TO_EMAILS;

if (!baseUrl || !authToken || !fromEmail || !toEmails) {
  console.error(
    'Missing LANEFUL_BASE_URL, LANEFUL_AUTH_TOKEN, LANEFUL_FROM_EMAIL, LANEFUL_TO_EMAILS'
  );
  process.exit(1);
}

const toEmail = toEmails.split(',')[0].trim();
const client = new LanefulClient(baseUrl, authToken);

const email: Email = {
  from: { email: fromEmail, name: 'Your Name' },
  to: [{ email: toEmail, name: 'Recipient Name' }],
  subject: 'Sandbox email',
  textContent: 'This email is sent with sandbox mode and returns message IDs.',
  fromHeader: { email: fromEmail, name: 'Newsletter' },
  tracking: {
    opens: true,
    clicks: true,
    unsubscribes: false,
    unsubscribeGroupName: 'Newsletters',
  },
};

const response = await client.sendEmail(email, {
  sandboxMode: true,
  returnMessageIds: true,
});

console.log(`Status: ${response.status}`);
console.log(`Message IDs: ${response.messageIds}`);
