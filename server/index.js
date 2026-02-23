const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Load env variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// CORS configure karein (Apne Frontend ka URL allow karein)
const corsOptions = {
    origin: [process.env.CLIENT_URL, "http://localhost:5173"], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', messageRoutes);

// Vercel Health Check Route
app.get('/api/status', (req, res) => {
    res.send('Express API is running perfectly on Vercel!');
});

// 🟢 VERCEL KE LIYE SABSE ZAROORI CHANGE:
// app.listen() hata diya gaya hai. 
// Vercel serverless functions use karta hai, isliye module.exports zaroori hai.
// ... Upar ka saara code same rahega (Routes, CORS etc.) ...

// 🟢 LOCALHOST KE LIYE (Jab aap apne computer par test kar rahe ho)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server is running locally on port ${PORT}`);
    });
}

// 🟢 VERCEL KE LIYE (Serverless export)
module.exports = app;