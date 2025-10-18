export function buildResetPasswordEmail({ name = 'there', resetUrl, appName = 'HearMe' }) {
  const subject = `${appName}: Reset your password`;
  const text = `Hi ${name},\n\nWe received a request to reset your password.\n\nClick the link below to set a new password:\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.\n\n— ${appName} Team`;

  const html = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a">
    <h2 style="margin:0 0 16px 0;">Reset your password</h2>
    <p style="margin:0 0 12px 0;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 12px 0;">We received a request to reset your password for your ${escapeHtml(appName)} account.</p>
    <p style="margin:0 0 16px 0;">Click the button below to set a new password:</p>
    <p>
      <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#6d28d9;color:#fff;text-decoration:none;border-radius:8px">Reset Password</a>
    </p>
    <p style="margin:16px 0 0 0;">If the button doesn't work, copy and paste this URL into your browser:</p>
    <p style="word-break:break-all;color:#334155;">${resetUrl}</p>
    <p style="margin:24px 0 0 0;color:#475569;">If you didn't request this, you can safely ignore this email.</p>
    <p style="margin:24px 0 0 0;">— ${escapeHtml(appName)} Team</p>
  </div>`;

  return { subject, text, html };
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default { buildResetPasswordEmail };

