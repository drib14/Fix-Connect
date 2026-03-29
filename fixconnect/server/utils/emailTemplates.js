const welcomeEmailTemplate = (email) => {
  const currentYear = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #121212;
      color: #ffffff;
      padding: 0;
      margin: 0;
    }
    .wrapper {
      padding: 40px 20px;
      background-color: #121212;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1e1e1e;
      padding: 40px;
      border-radius: 12px;
      border-top: 6px solid #4CAF50;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #4CAF50;
      font-size: 32px;
      margin: 0;
      letter-spacing: 2px;
    }
    .content h2 {
      color: #ffffff;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.8;
      color: #e0e0e0;
      margin-bottom: 20px;
    }
    .highlight {
      color: #4CAF50;
      font-weight: bold;
    }
    .btn {
      display: inline-block;
      padding: 15px 30px;
      background-color: #4CAF50;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .divider {
      height: 1px;
      background-color: #333333;
      margin: 30px 0;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #888888;
      line-height: 1.5;
    }
    .footer a {
      color: #4CAF50;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo">
        <h1>FixConnect</h1>
      </div>
      <div class="content">
        <h2>Welcome to the Community!</h2>
        <p>Hi <span class="highlight">${email}</span>,</p>
        <p>We are absolutely thrilled to welcome you to <strong>FixConnect</strong> — your premier platform for discovering and connecting with top-tier skilled professionals.</p>
        <p>Whether you're looking for an organized Virtual Assistant, a highly-skilled Web Developer, or a dedicated physical worker, we are here to bridge the gap between your needs and their expertise.</p>

        <div style="text-align: center;">
          <a href="http://localhost:5173/workers" class="btn">Explore Professionals</a>
        </div>

        <p>If you have any questions or need assistance, our support team is always ready to help.</p>
      </div>

      <div class="divider"></div>

      <div class="footer">
        <p>Best Regards,<br><strong>The FixConnect Team</strong></p>
        <p>
          Need help? <a href="#">Contact Support</a><br>
          &copy; ${currentYear} FixConnect. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

const otpEmailTemplate = (otp) => {
  const currentYear = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #121212;
      color: #ffffff;
      padding: 0;
      margin: 0;
    }
    .wrapper {
      padding: 40px 20px;
      background-color: #121212;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1e1e1e;
      padding: 40px;
      border-radius: 12px;
      border-top: 6px solid #FF9800;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      color: #FF9800;
      font-size: 32px;
      margin: 0;
      letter-spacing: 2px;
    }
    .content h2 {
      color: #ffffff;
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.8;
      color: #e0e0e0;
      margin-bottom: 20px;
    }
    .otp-container {
      background-color: #2a2a2a;
      border: 1px solid #444;
      border-radius: 8px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #FF9800;
      margin: 0;
    }
    .warning {
      font-size: 14px;
      color: #ff5252;
      margin-top: 10px;
    }
    .divider {
      height: 1px;
      background-color: #333333;
      margin: 30px 0;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #888888;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo">
        <h1>FixConnect</h1>
      </div>
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your FixConnect account. Please use the following One-Time Password (OTP) to proceed with resetting your password.</p>

        <div class="otp-container">
          <p style="margin-top: 0; color: #bbb;">Your Verification Code is:</p>
          <div class="otp-code">${otp}</div>
          <p class="warning">This code will expire in 10 minutes.</p>
        </div>

        <p>If you did not initiate this request, you can safely ignore this email. Your account remains secure.</p>
      </div>

      <div class="divider"></div>

      <div class="footer">
        <p>Best Regards,<br><strong>The FixConnect Team</strong></p>
        <p>&copy; ${currentYear} FixConnect. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

module.exports = { welcomeEmailTemplate, otpEmailTemplate };
