const User = require('../models/User');
const OtpVerification = require('../models/otpVerification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwt_SECRET = "varunchatapp";
const cloudinary = require('../middlewares/cloudinary');
const transporter = require('../config/nodemailer');
const Message = require('../models/Message');


const Register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(200).json({ status: false, msg: "please fill all the fields" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(200).json({ status: false, msg: 'Invalid email format' });

        }
        if (password.length < 6) {
            return res.status(200).json({ status: false, msg: 'Password should be at least 6 characters long' });
        }
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(200).json({ status: false, msg: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
        })

        const authUser = jwt.sign({ email: newUser.email }, jwt_SECRET, { expiresIn: '10m' });
        await newUser.save();

        // verification email
        const otp = Math.floor(100000 + Math.random() * 900000);
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Welcome to ChatApp',
            text: `Hello ${name},\n\nThank you for registering on ChatApp! Your account has been successfully created with the email: ${email}.\n\nBest regards,\nChatApp Team,\n\nYour OTP for verification is ${otp}\n\n Your OTP is valid for 10 minutes.`,
        }
        await transporter.sendMail(mailOptions);
        const newOtpVerification = new OtpVerification({
            email: email,
            otp: otp,
        })
        await newOtpVerification.save();

        return res.status(201).json({
            status: true,
            msg: 'User registered successfully and OTP sent to your email',
            authUser: authUser,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ staus: false, msg: 'An error occurred while registering the user' });

    }

}

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(200).json({ status: false, msg: "Please fill all the fields" });
        }
        const user = await User.findOne({ email: email });
        if (user) {
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (isValidPassword) {
                const token = jwt.sign({
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    profileImage: user.profileImage,
                }, jwt_SECRET);
                const authUser = jwt.sign({ email: user.email }, jwt_SECRET, { expiresIn: '10m' });
                if (user.isVerifiedAccount === false) {
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    const mailOptions = {
                        from: process.env.SMTP_USER,
                        to: email,
                        subject: 'Welcome to ChatApp',
                        text: `Hello ${user.name},\n\nThank you for registering on ChatApp! Your OTP is ${otp} and valid for 10 minutes.`,
                    };
                    await transporter.sendMail(mailOptions);
                    const otpVerification = await OtpVerification.findOneAndUpdate(
                        { email: email },
                        { otp: otp, expiresAt: Date.now() + 10 * 60 * 1000 }, // 10 minutes from now
                        { new: true, upsert: true } // Create a new document if it doesn't exist
                    )
                    return res.status(201).json({
                        status: true,
                        msg: 'OTP sent to your email',
                        authUser: authUser,
                    });
                }
                return res.status(200).json({ status: true, msg: 'User logged in successfully', token });
            }
            return res.status(400).json({ status: false, msg: 'Invalid credentials' });
        }

        return res.status(404).json({ status: false, msg: 'User not found' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, msg: 'An error occurred while logging in the user' });
    }
};


const getUserDetails = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ msg: 'Authorization header is missing' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, jwt_SECRET);
        const userId = decoded.id;
        const userDetails = await User.findById(userId).select('-password');
        res.status(200).json(userDetails);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: 'Invalid token' });
    }

}

// uploade profile img

const uploadProfileImg = async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });

    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwt_SECRET);

        const userId = decoded.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please upload an image.' });
        }

        const file = req.file.path;
        const cloudinaryResponse = await cloudinary.uploader.upload(file, {
            folder: 'chatapp_Images_On_Cloudinary',
        }
        );
        const imageUrl = cloudinaryResponse.secure_url;
        user.profileImage = imageUrl;

        await user.save();

        return res.status(200).json({
            message: 'Profile image uploaded successfully',
            imageUrl: imageUrl,
        });

    } catch (err) {
        console.error('Error uploading profile image:', err.message);
        res.status(500).json({ message: 'Failed to upload image', error: err.message });
    }
};


const verifyEmailOtp = async (req, res) => {
    const { otp } = req.body;
    const authHeader = req.headers.authorization;

    if (!otp || !authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({ msg: 'OTP and token are required' });
    }

    const authUser = authHeader.split(' ')[1];
    let email;

    try {
        const decoded = jwt.verify(authUser, jwt_SECRET);
        email = decoded.email;
    } catch (err) {
        return res.status(401).json({ msg: 'Invalid or expired token' });
    }

    try {
        const otpRecord = await OtpVerification.findOne({ email });
        if (!otpRecord) {
            return res.status(400).json({ msg: 'No OTP record found for this email' });
        }
        const now = new Date();
        if (now > otpRecord.expiresAt) {
            return res.status(401).json({ msg: 'OTP has expired' });
        }
        if (otp !== otpRecord.otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }
        await OtpVerification.updateOne(
            { email },
            { $set: { isVerifiedAccount: true } }
        );
        await User.updateOne(
            { email },
            { $set: { isVerifiedAccount: true } }
        );
        const user = await User.findOne({ email }).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        if (user) {
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    profileImage: user.profileImage,
                }, jwt_SECRET);
            return res.status(200).json({
                status: true,
                msg: 'User verified successfully',
                token: token,
            })
        }

    } catch (err) {
        console.error('Error verifying OTP:', err);
        return res.status(500).json({ msg: 'Server error while verifying OTP' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: 'Authorization header is missing or malformed' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ msg: 'Token is missing' });
        }
        const decoded = jwt.verify(token, jwt_SECRET);
        const isUserValid = await User.findById(decoded.id);
        if (!isUserValid) {
            return res.status(401).json({ msg: 'Invalid token' });
        }
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error while fetching users' });
    }
}

const sendMessage = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: 'Authorization header is missing or malformed' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwt_SECRET);
        const isUserValid = await User.findById(decoded.id);
        if (!isUserValid) {
            return res.status(401).json({ msg: 'Invalid token' });
        }

        const { userOneId, userTwoId, message } = req.body;
        if (!userOneId || !userTwoId || !message) {
            return res.status(400).json({ msg: 'Sender ID, Receiver ID, and message are required' });
        }

        // Check for existing conversation
        let existingMessage = await Message.findOne({
            $or: [
                { userOne: userOneId, userTwo: userTwoId },
                { userOne: userTwoId, userTwo: userOneId }
            ]
        });

        if (existingMessage) {
            // Make sure message is an array
            if (!Array.isArray(existingMessage.message)) {
                existingMessage.message = [];
            }

            // Push the new message
            existingMessage.message.push(message);
            existingMessage.timestamp = new Date();
            await existingMessage.save();
            return res.status(200).json({ msg: 'Message sent successfully', message: message });
        } else {
            // Create new conversation
            const newMessage = new Message({
                userOne: userOneId,
                userTwo: userTwoId,
                message: [message],
            });
            
            await newMessage.save();
            await User.findByIdAndUpdate(
                userOneId,
                { $addToSet: { friendLists: userTwoId } },
                { new: true }
            );

            await User.findByIdAndUpdate(
                userTwoId,
                {$addToSet : { friendLists: userOneId } },
                { new: true }
            )
            return res.status(200).json({ msg: 'Message sent successfully', message: newMessage });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error while sending message' });
    }
};

const getMessages = async (req, res) => { 
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: 'Authorization header is missing or malformed' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwt_SECRET);
        const isUserValid = await User.findById(decoded.id);
        if (!isUserValid) {
            return res.status(401).json({ msg: 'Invalid token' });
        }
        const { userOneId, userTwoId } = req.params;
        if (!userOneId || !userTwoId) {
            return res.status(400).json({ msg: 'Authorization header is missing UserOne and UserTwo' });
        }
        const messages = await Message.findOne({
            $or: [
                { userOne: userOneId, userTwo: userTwoId },
                { userOne: userTwoId, userTwo: userOneId }
            ]
        });
        res.status(200).json(messages || { message: [] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error while fetching messages' });
    }
};

module.exports = { Register, Login, getUserDetails, uploadProfileImg, verifyEmailOtp, getAllUsers, sendMessage, getMessages }; 