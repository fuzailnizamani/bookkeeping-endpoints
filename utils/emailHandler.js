const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const sendVerificationEmail = async (options) => {
  try {
      console.log(`console.log options: ${options}`);
      console.log(options.to);
      console.log(options.subject);
      console.log(options.text);
      console.log(process.env.EMAIL_USERNAME);
      const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      });

      const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: options.to,
      subject: options.subject,
      html: options.text,
      };

      await transporter.sendMail(mailOptions);
      console.log('Verification email sent to:', options.to);
  }catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }  
};

module.exports = sendVerificationEmail;