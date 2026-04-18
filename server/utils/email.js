const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use standard service or configure host/port
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const logoUrl = 'https://res.cloudinary.com/dwquuisuj/image/upload/v1776509380/fixconnect_logo.png';

    const mailOptions = {
      from: `FixConnect <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              background-color: #f4f7f6;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background-color: #2e3b4e;
              padding: 30px 20px;
              text-align: center;
              color: #ffffff;
            }
            .header img {
              max-width: 120px;
              margin-bottom: 10px;
              border-radius: 50%; /* if logo looks better circular */
              background-color: white;
              padding: 5px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              letter-spacing: 1px;
            }
            .content {
              padding: 40px 30px;
              color: #333333;
              line-height: 1.6;
            }
            .otp-container {
              background-color: #f9f9f9;
              border: 1px solid #e0e0e0;
              border-radius: 6px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #2e3b4e;
              letter-spacing: 5px;
            }
            .footer {
              background-color: #f4f7f6;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #888888;
              border-top: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${logoUrl}" alt="FixConnect Logo" />
              <h1>FixConnect</h1>
            </div>
            <div class="content">
              <h2>${options.heading || 'Hello,'}</h2>
              <p>${options.message}</p>
              ${options.otp ? `
                <div class="otp-container">
                  <span class="otp-code">${options.otp}</span>
                </div>
                <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
              ` : ''}
              <p>If you didn't request this, you can safely ignore this email.</p>
              <p>Best regards,<br/>The FixConnect Team</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} FixConnect. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;