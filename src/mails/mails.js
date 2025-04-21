const sgMail = require("@sendgrid/mail");
const { ErrorHandler } = require("../utils/error-handler");

// Add SendGrid API Key
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const setTemplate = (title = "", name = "", text = "", otp) => {
  return `<!DOCTYPE html>
  <html>
  <head>
  <title>${title}</title>
  </head>
  <body style="background-color: #F5F5F5; color: #333; font-family: Arial, sans-serif; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background: #FFF; border: 1px solid #ddd;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <img src="${process.env.UI_LINK}/dropship-logo.png" alt="Logo" style="width: 200px; height: 80px;background: black;">
          <h1 style="color: #17a2b8;">${title}</h1>
          <h3>Your One Time Password (OTP)</h3>
          <p style="color: #333; font-family: Arial, sans-serif;">Hey <span style="color: #17a2b8; font-weight: bold;">${name}</span>, ${text}</p>
          <p style="font-size: 25px; background: #F5F5F5; padding: 8px; font-weight: bold; color: #17a2b8; margin: 20px 0;">${otp}</p>
          <p style="color: #333; font-family: Arial, sans-serif;">If you did not request a password reset, please ignore this email or <a href="mailto:support@email.com" style="color: #17a2b8; text-decoration: none;">contact support</a>.</p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #F5F5F5; color: #333; padding: 10px; font-size: 12px; text-align: center;">
          &copy; Account Academy. All rights reserved.
          <br>
          <a href="your-privacy-policy-url" style="color: #17a2b8; text-decoration: none;">Privacy Policy</a> | <a href="your-terms-url" style="color: #17a2b8; text-decoration: none;">Terms of Conditions</a>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

const sendEmail = async (emailDetails) => {
  // Use SendGrid to send the email
  try {
    await sgMail.send(emailDetails);
  } catch (error) {
    throw new ErrorHandler(400, error.message || "Error sending email");
  }
};

const sendEmailToUserWithOTP = async ({ email: userEmail, name }, otp) => {
  const title = "Email Verification",
    text = "please use the following OTP to verify your email address",
    link = "https://your-verification-link.com",
    buttonText = "Verify Email";

  const html = setTemplate(title, name, text, otp, link, buttonText);
  const emailDetails = {
    from: process.env.SMTP_MAIL,
    to: userEmail,
    subject: "Email Verification",
    html,
  };

  await sendEmail(emailDetails);
};

const sendGenericEmail = async (userEmail, subject, message) => {
  const emailDetails = {
    to: userEmail,
    from: process.env.SMTP_MAIL, // Replace with your verified sender email
    subject,
    html: `<div style="background-color: #2d4061; border-radius: 8px; max-width: 500px; margin: auto; padding: 30px 20px 90px 15px">
<h4 style="text-align: center; color: #fff; font-family: sans-serif;">
${message}
</h4>
</div>`,
  };

  await sendEmail(emailDetails);
};

const sendEmailToUserWithPassword = async (
  userEmail,
  subject,
  message,
  password
) => {
  const emailDetails = {
    to: userEmail,
    from: process.env.SMTP_MAIL, // Replace with your verified sender email
    subject,
    text: message,
    html: `<!DOCTYPE html>
  <html>
  <head>
  <title>Account Academy</title>
  </head>
  <body style="background-color: #F5F5F5; color: #333; font-family: Arial, sans-serif; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background: #FFF; border: 1px solid #ddd;">
      <tr>
        <td style="padding: 20px; text-align: center;">
          <img src="${process.env.UI_LINK}/dropship-logo.png" alt="Logo" style="width: 200px; height: 50px; background: black; ">
          <h1 style="color: #17a2b8;">${subject}</h1>
          <p style="color: #333; font-family: Arial, sans-serif;">${message}</p>
          <p style="font-size: 25px; background: #F5F5F5; padding: 8px; font-weight: bold; color: #17a2b8; margin: 20px 0;">${password}</p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #F5F5F5; color: #333; padding: 10px; font-size: 12px; text-align: center;">
          &copy; Account Academy. All rights reserved.
          <br>
          <a href="your-privacy-policy-url" style="color: #17a2b8; text-decoration: none;">Privacy Policy</a> | <a href="your-terms-url" style="color: #17a2b8; text-decoration: none;">Terms of Conditions</a>
        </td>
      </tr>
    </table>
  </body>
  </html>`,
  };

  await sendEmail(emailDetails);
};

// Similarly update sendEmailToUserWithPassword and sendEmailToNewlyVerifiedUser

const MAIL_HANDLER = {
  sendEmailToUserWithOTP,
  sendEmailToUserWithPassword,
  sendGenericEmail,
};

module.exports = MAIL_HANDLER;
