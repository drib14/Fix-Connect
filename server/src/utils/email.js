const nodemailer = require('nodemailer');

const sendResetPasswordEmail = async (email, resetToken) => {
  // In development, we use Ethereal email for testing.
  // In production, configure your actual SMTP server.
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // For testing, the reset link is just a placeholder.
  // The frontend needs to handle this route.
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

  const info = await transporter.sendMail({
    from: '"Fix-Connect Support" <no-reply@fixconnect.com>',
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset.</p><p>Please click on the following link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = {
  sendResetPasswordEmail,
};
