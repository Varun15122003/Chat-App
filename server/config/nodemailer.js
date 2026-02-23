const nodemailer = require('nodemailer');

// const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// module.exports = transporter;

// 🟢 Connection Test karne ke liye ek logger (Optional par recommended)
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Mail Server Error:", error);
    } else {
        console.log("✅ Mail Server is ready to send messages");
    }
});

module.exports = transporter;