const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, otp, firstname) => {
  // Read the HTML template
  const templatePath = path.join(__dirname, "PasswordReset.html");
  let html = fs.readFileSync(templatePath, "utf8");

  // Replace the placeholder with the actual OTP and firstname
  html = html.replace("{{otp}}", otp);
  html = html.replace("{{name}}", firstname);

  console.log(`Sending OTP: ${otp} to ${email}`);

  //Send mail
  await transporter.sendMail({
    from: "My home et al verify@myhomeetal.com",
    to: email,
    subject: "OTP to reset your password",
    html,
  });
};
module.exports = sendPasswordResetEmail;
