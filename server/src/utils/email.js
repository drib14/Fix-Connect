const nodemailer = require('nodemailer');

// Helper to get SMTP transporter
const getTransporter = async () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (user && pass) {
    // Use Gmail SMTP with credentials provided in .env
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  // Fallback to Ethereal in development
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendResetPasswordEmail = async (email, resetToken) => {
  const transporter = await getTransporter();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  const info = await transporter.sendMail({
    from: `"Fix-Connect Support" <${process.env.EMAIL_USER || 'no-reply@fixconnect.com'}>`,
    to: email,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg">
        <h2 style="color: #0f172a; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="color: #475569; line-height: 1.6;">You requested a password reset for your Fix-Connect account. Click the button below to complete the request:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">If you did not request this, please ignore this email. This link will expire in 1 hour.</p>
      </div>
    `,
  });

  console.log('Reset email sent: %s', info.messageId);
  if (!process.env.EMAIL_USER) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

const sendBookingCreatedEmail = async (customer, worker, booking) => {
  const transporter = await getTransporter();
  const dateStr = new Date(booking.bookingDate).toLocaleDateString();

  // Send email to Customer
  const customerMail = await transporter.sendMail({
    from: `"Fix-Connect" <${process.env.EMAIL_USER || 'no-reply@fixconnect.com'}>`,
    to: customer.email,
    subject: 'Booking Created successfully',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #059669; margin-bottom: 10px;">Booking Placed!</h2>
        <p style="color: #475569;">Hi ${customer.fullName}, your booking has been created and is pending confirmation from the service worker.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <h3 style="color: #0f172a;">Booking Details</h3>
        <p><strong>Worker:</strong> ${worker.fullName}</p>
        <p><strong>Date/Time:</strong> ${dateStr} at ${booking.bookingTime}</p>
        <p><strong>Address:</strong> ${booking.address}</p>
        <p><strong>Amount:</strong> ₱${booking.amount.toFixed(2)}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
      </div>
    `,
  });

  // Send email to Worker
  const workerMail = await transporter.sendMail({
    from: `"Fix-Connect" <${process.env.EMAIL_USER || 'no-reply@fixconnect.com'}>`,
    to: worker.email,
    subject: 'New Booking Request Received',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #ea580c; margin-bottom: 10px;">New Booking Request!</h2>
        <p style="color: #475569;">Hi ${worker.fullName}, you have received a new service booking request from ${customer.fullName}.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <h3 style="color: #0f172a;">Booking Details</h3>
        <p><strong>Customer:</strong> ${customer.fullName} (${customer.phoneNumber})</p>
        <p><strong>Date/Time:</strong> ${dateStr} at ${booking.bookingTime}</p>
        <p><strong>Address:</strong> ${booking.address}</p>
        <p><strong>Amount:</strong> ₱${booking.amount.toFixed(2)}</p>
        <p><strong>Description:</strong> ${booking.description || 'No notes provided'}</p>
        <p style="margin-top: 20px; font-weight: bold; color: #059669;">Please log into your dashboard to accept or decline this booking request.</p>
      </div>
    `,
  });

  console.log('Booking notification emails sent');
};

const sendBookingStatusEmail = async (customer, worker, booking) => {
  const transporter = await getTransporter();
  const dateStr = new Date(booking.bookingDate).toLocaleDateString();

  const statusColors = {
    ACCEPTED: '#059669',
    REJECTED: '#dc2626',
    COMPLETED: '#2563eb',
    CANCELLED: '#475569',
  };

  const statusText = {
    ACCEPTED: 'Accepted by Worker',
    REJECTED: 'Declined by Worker',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  const color = statusColors[booking.status] || '#0f172a';
  const statusName = statusText[booking.status] || booking.status;

  const info = await transporter.sendMail({
    from: `"Fix-Connect" <${process.env.EMAIL_USER || 'no-reply@fixconnect.com'}>`,
    to: customer.email,
    subject: `Booking Status Update: ${statusName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: ${color}; margin-bottom: 10px;">Booking Updated</h2>
        <p style="color: #475569;">Hi ${customer.fullName}, the status of your booking with ${worker.fullName} has changed to <strong style="color: ${color};">${statusName}</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <h3 style="color: #0f172a;">Booking Summary</h3>
        <p><strong>Date/Time:</strong> ${dateStr} at ${booking.bookingTime}</p>
        <p><strong>Service Location:</strong> ${booking.address}</p>
        <p><strong>Total Price:</strong> ₱${booking.amount.toFixed(2)}</p>
        <p><strong>Payment Status:</strong> ${booking.paymentStatus}</p>
      </div>
    `,
  });

  console.log('Booking status update email sent to customer');
};

module.exports = {
  sendResetPasswordEmail,
  sendBookingCreatedEmail,
  sendBookingStatusEmail,
};
