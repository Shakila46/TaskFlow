import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
  try {
    // If EMAIL_USER and EMAIL_PASS are not set, you can use a test account for development.
    // However, to send real emails, you must configure these in .env
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CyphLab" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
