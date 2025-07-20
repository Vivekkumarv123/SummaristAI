const nodemailer = require("nodemailer");

const sendSummaryWithAttachment = (recipientEmail, fileName, callback) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: recipientEmail,
    subject: "Your Summary File from Summarist CLI",
    text: "Please find your summarized file attached.",
    attachments: [
      {
        filename: fileName,
        path: `./${fileName}`,
      },
    ],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending email:", error);
    } else {
      console.log("✅ Email sent:", info.response);
    }
    if (callback) callback();
  });
};

module.exports = {
  sendSummaryWithAttachment,
};
