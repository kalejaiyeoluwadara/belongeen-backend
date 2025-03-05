require("dotenv").config();
const nodemailer = require("nodemailer");

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
      <!DOCTYPE html>
      <html lang="en" style="padding: 0; margin: 0; box-sizing: border-box; font-family: 'Nunito', 'Segoe UI', 'Arial Rounded MT', 'Open Sans', 'Helvetica', 'Arial', sans-serif;">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
      </head>
      <body style="background-color: #f4f4f4; padding: 20px;">
          <table align="center" width="100%" style="max-width: 600px; background: #fff; border-radius: 8px; border: 1px solid #ddd; padding: 20px;">
              <tr>
                  <td align="left">
                      <img src="https://res.cloudinary.com/diccn7l1x/image/upload/v1731786393/belongeen_ico_mlm7gf.png"
                alt="Belongeen Logo" style="width: 60px; height:60px;margin-bottom: 20px;">
                  </td>
              </tr>
              <tr>
                  <td align="left">
                      <h2 style="color: #333; margin: 0;">Hello!</h2>
                  </td>
              </tr>
              <tr>
                  <td align="left" style="color: #555; font-size: 16px;">
                      <p>You are receiving this email because you have forgotten your password and want to get back into your account through an app.</p>
                      <p>Here is your reset code below:</p>
                  </td>
              </tr>
              <tr>
                  <td align="center" style="padding: 20px 0;">
                      <table width="100%" cellspacing="0" cellpadding="10" style="background-color: #f4f4f4; border-radius: 5px; text-align: center;">
                          <tr>
                              <td style="font-size: 24px; font-weight: bold; color: #333;">${otp}</td>
                          </tr>
                      </table>
                  </td>
              </tr>
              <tr>
                  <td align="center" style="color: #555; font-size: 14px; padding-top: 20px;">
                      <p>Copy the code above and use it to reset your password.</p>
                  </td>
              </tr>
          </table>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = sendOtpEmail;
