const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const sendVerificationEmail = async (email) => {
  try {
      // Generate a verification token (valid for 1 hour)
      const token = jwt.sign({ email }, process.env.EMAIL_SECRET, { expiresIn: '1h' });

      const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

      const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      });

      const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Verify Your New Email',
      // html: `<p>Click <a href="${verificationLink}/verify-email?token=YOUR_TOKEN">here</a> to verify your email.</p>`,
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
      };

      await transporter.sendMail(mailOptions);
      console.log('Verification email sent to:', email);
  }catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }  
};

module.exports = sendVerificationEmail;