const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send a professional branded OTP verification email to the user.
 * @param {string} toEmail User email address
 * @param {string} otp 6-digit verification code
 * @param {string} name User name
 */
async function sendOtpEmail(toEmail, otp, name) {
  const mailOptions = {
    from: `"FixConnect" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your FixConnect verification code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 580px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          .header {
            background-color: #2E7D32;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
          }
          .content h2 {
            font-size: 18px;
            font-weight: 600;
            margin-top: 0;
            color: #2E7D32;
          }
          .otp-container {
            text-align: center;
            margin: 30px 0;
            background-color: #F1F8E9;
            border: 2px dashed #81C784;
            border-radius: 12px;
            padding: 20px;
          }
          .otp-code {
            font-size: 32px;
            font-weight: 800;
            color: #2E7D32;
            letter-spacing: 6px;
            margin: 0;
          }
          .footer {
            background-color: #fafbfc;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #eeeeee;
            font-size: 12px;
            color: #777777;
          }
          .footer p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>FixConnect</h1>
          </div>
          <div class="content">
            <h2>Hello, ${name}!</h2>
            <p>We received a request to reset the password for your FixConnect account. Please use the verification code below to complete the reset process:</p>
            
            <div class="otp-container">
              <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #558B2F; letter-spacing: 1px;">Verification Code</p>
              <div class="otp-code">${otp}</div>
            </div>
            
            <p>This verification code is only valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email — your account remains secure.</p>
            <p>Warm regards,<br><strong>The FixConnect Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email, please do not reply directly.</p>
            <p>&copy; 2026 FixConnect. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendOtpEmail,
};
