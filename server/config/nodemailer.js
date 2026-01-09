const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS ke liye false rahega (Port 587)
    pool: true,    // 🟢 Connections ko reuse karega (Performance ke liye best)
    maxConnections: 5, // Ek saath kitne connection khule reh sakte hain
    maxMessages: 100,  // Ek connection khatam hone se pehle kitne mail bhej sakta hai
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // ⚠️ Dhyaan rahe yahan Gmail ka "App Password" use karein
    },
    tls: {
        // 🟢 Docker/Azure environment mein SSL certificate issues se bachne ke liye
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    },
    // 🟢 Reliability ke liye timeouts badhaye gaye hain
    connectionTimeout: 30000, // 30 seconds
    greetingTimeout: 30000,
    socketTimeout: 30000,
});

// 🟢 Connection Test karne ke liye ek logger (Optional par recommended)
transporter.verify((error, success) => {
    if (error) {
        console.log("❌ Mail Server Error:", error);
    } else {
        console.log("✅ Mail Server is ready to send messages");
    }
});

module.exports = transporter;