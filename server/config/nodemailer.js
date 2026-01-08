const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // 587 ke liye hamesha false rahega
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Yahan 16-digit App Password hi hona chahiye
    },
    tls: {
        // Render network par SSL issues se bachne ke liye
        rejectUnauthorized: false 
    }
});

module.exports = transporter;