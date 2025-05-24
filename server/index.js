const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const connectDB = require('./config/db');
const cors = require('cors');

dotenv.config();
connectDB();

const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
    optionSuccessStatus: 200,
};


const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/',(req,res)=>{
    res.send('Hello sir Welcome to the world of NodeJS project created by varun');
})

app.use('/api/auth', authRoutes);
app.use('/api/chat', messageRoutes);

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
})