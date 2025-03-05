require("dotenv").config();
const nodemailer = require("nodemailer");

// Create a Nodemailer transporter using Google SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});
const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You have requested to reset your password. Use the following OTP to proceed:</p>
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px; text-align: center;">
            <h1 style="letter-spacing: 10px; color: #333;">${otp}</h1>
          </div>
          <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
          <small>If you did not request this, please ignore this email.</small>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
module.exports = sendOtpEmail;
