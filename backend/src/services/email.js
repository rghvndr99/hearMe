/*
  Pluggable email service: supports LOG (default), RESEND, SENDGRID, SES
  Configure with env:
    EMAIL_PROVIDER=LOG|RESEND|SENDGRID|SES
    EMAIL_FROM="HearMe <no-reply@yourdomain>"

    RESEND_API_KEY=...

    SENDGRID_API_KEY=...

    AWS_REGION=...
    AWS_ACCESS_KEY_ID=...
    AWS_SECRET_ACCESS_KEY=...
*/

const provider = process.env.EMAIL_PROVIDER || 'LOG';
const from = process.env.EMAIL_FROM || 'HearMe <no-reply@hearme.local>';

export async function sendMail({ to, subject, html, text }) {
  if (!to) throw new Error('sendMail: `to` is required');
  if (!subject) throw new Error('sendMail: `subject` is required');

  switch (provider.toUpperCase()) {
    case 'RESEND': {
      try {
        const { Resend } = await import('resend');
        const client = new Resend(process.env.RESEND_API_KEY);
        const resp = await client.emails.send({ from, to, subject, html, text });
        return resp;
      } catch (err) {
        throw new Error(`RESEND provider not available or failed: ${err.message}`);
      }
    }
    case 'SENDGRID': {
      try {
        const sg = await import('@sendgrid/mail');
        const sgMail = sg.default || sg;
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const [resp] = await sgMail.send({ to, from, subject, html, text });
        return resp;
      } catch (err) {
        throw new Error(`SENDGRID provider not available or failed: ${err.message}`);
      }
    }
    case 'SES': {
      try {
        const aws = await import('@aws-sdk/client-ses');
        const { SESClient, SendEmailCommand } = aws;
        const client = new SESClient({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          } : undefined,
        });
        const params = {
          Source: from,
          Destination: { ToAddresses: Array.isArray(to) ? to : [to] },
          Message: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: html ? { Html: { Data: html, Charset: 'UTF-8' } } : { Text: { Data: text || '', Charset: 'UTF-8' } },
          },
        };
        const resp = await client.send(new SendEmailCommand(params));
        return resp;
      } catch (err) {
        throw new Error(`SES provider not available or failed: ${err.message}`);
      }
    }
    case 'LOG':
    default: {
      // Development: log email to console
      const payload = { to, from, subject, text, html };
      console.log('📧 [LOG EMAIL]', JSON.stringify(payload, null, 2));
      return { logged: true };
    }
  }
}

export default { sendMail };

