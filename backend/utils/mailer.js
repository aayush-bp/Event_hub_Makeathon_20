const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: true,
  debug: true,
});

/**
 * Send a welcome email after registration
 * @param {string} toEmail - Recipient email
 * @param {string} name - Recipient name
 */
const sendWelcomeEmail = async (toEmail, name) => {
  const mailOptions = {
    from: `"Event Hub" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Welcome to Event Hub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Welcome to Event Hub, ${name}!</h1>
        <p style="font-size: 16px; color: #374151;">
          Your account has been created successfully. You can now explore and register for exciting events happening across your organization.
        </p>
        <p style="font-size: 16px; color: #374151;">
          Here's what you can do:
        </p>
        <ul style="font-size: 15px; color: #374151;">
          <li>Browse and register for upcoming events</li>
          <li>Get personalized event recommendations</li>
          <li>Receive notifications for events you care about</li>
        </ul>
        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
          — The Event Hub Team
        </p>
      </div>
    `,
  };

  try {
    console.log('[Mailer] Attempting to send email to:', toEmail);
    console.log('[Mailer] From:', process.env.SMTP_USER);
    console.log('[Mailer] SMTP_PASS set:', !!process.env.SMTP_PASS);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] Welcome email sent to ${toEmail}, messageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[Mailer] Failed to send welcome email to ${toEmail}:`);
    console.error('[Mailer] Error code:', err.code);
    console.error('[Mailer] Error message:', err.message);
    console.error('[Mailer] Full error:', err);
  }
};

module.exports = { sendWelcomeEmail };
