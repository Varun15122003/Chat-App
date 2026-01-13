const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Path module add kiya
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const connectDB = require('./config/db');
const cors = require('cors');

dotenv.config();
connectDB();

// Azure hamesha process.env.PORT provide karta hai
const PORT = process.env.PORT || 8080; 

const app = express();

const corsOptions = {
    // Azure URL aur localhost dono ko allow karein
    origin: [process.env.CLIENT_URL, "http://localhost:5173", "https://webchatapp-gee4a3a7d3g7aqbe.centralindia-01.azurewebsites.net"],
    methods: ['GET', 'POST'],
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Pehle API Routes rakhein
app.use('/api/auth', authRoutes);
app.use('/api/chat', messageRoutes);

// 2. Frontend ki Static files ka raasta (Docker structure ke hisaab se)
// Agar aap Vite use kar rahe hain toh 'dist' hoga, Create React App hai toh 'build'
const __dirname_root = path.resolve();
app.use(express.static(path.join(__dirname_root, 'client/dist')));

// 3. Welcome Message ya API check
app.get('/api/status', (req, res) => {
    res.send('Server is running and healthy!');
});

// 4. Sabse niche: Har wo request jo API nahi hai, use Frontend bhejein
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname_root, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});