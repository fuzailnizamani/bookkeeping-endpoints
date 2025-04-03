const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'your-app@example.com',
    to: email,
    subject: 'Verify Your New Email',
    html: `<p>Click <a href="${process.env.BASE_URL}/verify-email?token=YOUR_TOKEN">here</a> to verify your email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;