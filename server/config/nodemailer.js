const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    pool: true, // 🟢 Connection pool use karein taaki connection open rahe
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, 
    },
    tls: {
        rejectUnauthorized: false 
    },
    connectionTimeout: 20000, // 20 seconds tak wait karega
    greetingTimeout: 20000,
    socketTimeout: 20000,
});

module.exports = transporter;