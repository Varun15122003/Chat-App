const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const jwt_SECRET = "varunchatapp";
const jwt_SECRET = process.env.JWT_SECRET || "varunchatapp";

const cloudinary = require('../middlewares/cloudinary');
const transporter = require('../config/nodemailer');
const Message = require('../models/Message');
const OtpVerification = require('../models/OtpVerification');


// const Register = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;
//         if (!name || !email || !password) {
//             return res.status(200).json({ status: false, msg: "please fill all the fields" });
//         }
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(email)) {
//             return res.status(200).json({ status: false, msg: 'Invalid email format' });

//         }
//         if (password.length < 6) {
//             return res.status(200).json({ status: false, msg: 'Password should be at least 6 characters long' });
//         }
//         const user = await User.findOne({ email: email });
//         if (user) {
//             return res.status(200).json({ status: false, msg: 'User hgy already exists' });
//         }
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = new User({
//             name: name,
//             email: email,
//             password: hashedPassword,
//         })

//         const authUser = jwt.sign({ email: newUser.email }, jwt_SECRET, { expiresIn: '10m' });
//         await newUser.save();

//         // verification email
//         const otp = Math.floor(100000 + Math.random() * 900000);
//         const mailOptions = {
//             from: process.env.SMTP_USER,
//             to: email,
//             subject: 'Welcome to ChatApp',
//             text: `Hello ${name},\n\nThank you for registering on ChatApp! Your account has been successfully created with the email: ${email}.\n\nBest regards,\nChatApp Team,\n\nYour OTP for verification is ${otp}\n\n Your OTP is valid for 10 minutes.`,
//         }
//         await transporter.sendMail(mailOptions);
//         const newOtpVerification = new OtpVerification({
//             email: email,
//             otp: otp,
//         })
//         await newOtpVerification.save();

//         return res.status(201).json({
//             status: true,
//             msg: 'User registered successfully and OTP sent to your email',
//             authUser: authUser,
//         });
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ staus: false, msg: 'An error occurred while registering the user' });

//     }

// }

// const Login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         if (!email || !password) {
//             return res.status(200).json({ status: false, msg: "Please fill all the fields" });
//         }
//         const user = await User.findOne({ email: email });
//         if (user) {
//             const isValidPassword = await bcrypt.compare(password, user.password);
//             if (isValidPassword) {
//                 const token = jwt.sign({
//                     id: user._id,
//                     email: user.email,
//                     name: user.name,
//                     profileImage: user.profileImage,
//                 }, jwt_SECRET);
//                 const authUser = jwt.sign({ email: user.email }, jwt_SECRET, { expiresIn: '10m' });
//                 if (user.isVerifiedAccount === false) {
//                     const otp = Math.floor(100000 + Math.random() * 900000);
//                     const mailOptions = {
//                         from: process.env.SMTP_USER,
//                         to: email,
//                         subject: 'Welcome to ChatApp',
//                         text: `Hello ${user.name},\n\nThank you for registering on ChatApp! Your OTP is ${otp} and valid for 10 minutes.`,
//                     };
//                     await transporter.sendMail(mailOptions);
//                     const otpVerification = await OtpVerification.findOneAndUpdate(
//                         { email: email },
//                         { otp: otp, expiresAt: Date.now() + 10 * 60 * 1000 }, // 10 minutes from now
//                         { new: true, upsert: true } // Create a new document if it doesn't exist
//                     )
//                     return res.status(201).json({
//                         status: true,
//                         msg: 'OTP sent to your email',
//                         authUser: authUser,
//                     });
//                 }
//                 return res.status(200).json({ status: true, msg: 'User logged in successfully', token });
//             }
//             return res.status(400).json({ status: false, msg: 'Invalid credentials' });
//         }

//         return res.status(404).json({ status: false, msg: 'User not found' });

//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({ status: false, msg: 'An error occurred while logging in the user' });
//     }
// };
const Register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // 1. Validations
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

        // 2. Check existing user
        const userExists = await User.findOne({ email: email });
        if (userExists) {
            return res.status(200).json({ status: false, msg: 'User already exists' });
        }

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
        });

        // 4. Generate OTP & JWT
        const authUser = jwt.sign({ email: newUser.email }, jwt_SECRET, { expiresIn: '10m' });
        const otp = Math.floor(100000 + Math.random() * 900000);

        // 5. Save User & OTP to Database First 🟢 (Sabse important change)
        // Isse agar email fail bhi ho jaye, user DB mein rahega aur OTP verify ho sakega
        await newUser.save();
        
        const newOtpVerification = new OtpVerification({
            email: email,
            otp: otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000 // 10 minutes expiry
        });
        await newOtpVerification.save();

        // 6. Send Email in a non-blocking way with Try-Catch
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: 'Welcome to ChatApp - Verify your Email',
                text: `Hello ${name},\n\nYour OTP for verification is ${otp}.\n\nThis OTP is valid for 10 minutes.\n\nBest regards,\nChatApp Team`,
            };
            
            // Render par timeout se bachne ke liye hum await karenge par inner try-catch ke sath
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully to:", email);

        } catch (emailErr) {
            // Agar Render par connection timeout hota hai toh yahan error aayega par 
            // response 201 hi jayega kyunki humne upar OTP save kar liya hai.
            console.error("Email Sending Failed (Render Timeout): ", emailErr.message);
        }

        // 7. Send Success Response
        return res.status(201).json({
            status: true,
            msg: 'User registered successfully. Moving to verification...',
            authUser: authUser,
        });

    } catch (err) {
        console.error("Register Error: ", err);
        return res.status(500).json({ status: false, msg: 'An error occurred during registration' });
    }
}

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(200).json({ status: false, msg: "Please fill all the fields" });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ status: false, msg: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ status: false, msg: 'Invalid credentials' });
        }

        // 1. Check if Account is Verified
        if (user.isVerifiedAccount === false) {
            const authUser = jwt.sign({ email: user.email }, jwt_SECRET, { expiresIn: '10m' });
            const otp = Math.floor(100000 + Math.random() * 900000);

            try {
                const mailOptions = {
                    from: process.env.SMTP_USER,
                    to: email,
                    subject: 'Verify your ChatApp Account',
                    text: `Hello ${user.name},\n\nYour OTP is ${otp}. It is valid for 10 minutes.`,
                };
                await transporter.sendMail(mailOptions);

                await OtpVerification.findOneAndUpdate(
                    { email: email },
                    { otp: otp, expiresAt: Date.now() + 10 * 60 * 1000 },
                    { new: true, upsert: true }
                );
            } catch (mailErr) {
                console.error("Login Email Error: ", mailErr.message);
            }

            return res.status(201).json({
                status: true,
                msg: 'Account not verified. OTP sent to your email',
                authUser: authUser,
            });
        }

        // 2. Successful Login Token
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            name: user.name,
            profileImage: user.profileImage,
        }, jwt_SECRET, { expiresIn: '24h' });

        return res.status(200).json({ 
            status: true, 
            msg: 'User logged in successfully', 
            token 
        });

    } catch (err) {
        console.error("Login Error: ", err);
        return res.status(500).json({ status: false, msg: 'An error occurred while logging in' });
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
    console.log("req.file:", req.file);
    const authHeader = req.headers.authorization;
    console.log("authHeader:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });

    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, jwt_SECRET);

        const userId = decoded.id;
        const user = await User.findById(userId);
        console.log("user:", user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please upload an image.' });
        }

        const file = req.file.path;
        const cloudinaryResponse = await cloudinary.uploader.upload(file, {
            folder: 'chatapp_Images_On_Cloudinary',
            resource_type: 'auto'

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


const uploadMedia = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Authorization header missing or malformed'
        })
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
            return res.status(400).json({
                message: 'No file uploaded. Please upload an image or video.'
            });
        }

        // 🔹 1. DETERMINE RESOURCE TYPE (Fix for PDF/Docx)
        let resourceType = 'auto';

        // Check for PDF or Document extensions -> Force 'raw'
        if (req.file.mimetype === 'application/pdf' ||
            req.file.originalname.match(/\.(doc|docx|txt|ppt|pptx|xls|xlsx)$/i)) {
            resourceType = 'raw';
        }

        // 🔹 2. PREPARE UPLOAD OPTIONS
        const uploadOptions = {
            folder: 'chatapp_media',
            resource_type: resourceType,
        };

        // 🔹 3. ADD COMPRESSION (Only for Images/Videos)
        // We do NOT add this for 'raw' files because it breaks them
        if (resourceType === 'auto') {
            uploadOptions.quality = 'auto';       // Auto-adjust quality to reduce size
            uploadOptions.fetch_format = 'auto';  // Convert to efficient format (like WebP)
        }

        const filePath = req.file.path;

        // 🔹 4. UPLOAD TO CLOUDINARY
        const cloudinaryResponse = await cloudinary.uploader.upload(filePath, uploadOptions);

        const mediaUrl = cloudinaryResponse.secure_url;

        // 🔹 5. MAP EXTENSION TO MEDIA TYPE
        let mediaType = 'document'; // Default fallback

        // Get extension from Cloudinary or fallback to original filename
        const ext = (cloudinaryResponse.format || req.file.originalname.split('.').pop()).toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) {
            mediaType = 'image';
        } else if (['mp4', 'mkv', 'avi', 'mov', 'wmv', 'webm'].includes(ext)) {
            mediaType = 'video';
        } else if (['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'].includes(ext)) {
            mediaType = 'audio';
        } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'ppt', 'pptx'].includes(ext)) {
            mediaType = 'document';
        }

        return res.status(200).json({
            message: 'Media uploaded successfully',
            mediaUrl: mediaUrl,
            mediaType: mediaType,
        });

    } catch (err) {
        // 🔹 Handle File Size Error (from Multer)
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File is too large. Max limit is 50MB.' });
        }
        console.error('Error uploading media:', err.message);
        res.status(500).json({ message: 'Failed to upload media', error: err.message });
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
                { $addToSet: { friendLists: userOneId } },
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

        // 🟢 1. Grab Page and Limit from Query (Default: Page 1, 20 msgs)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const conversation = await Message.findOne({
            $or: [
                { userOne: userOneId, userTwo: userTwoId },
                { userOne: userTwoId, userTwo: userOneId }
            ]
        });

        if (!conversation) {
            return res.status(200).json({ message: [] });
        }

        // 🟢 2. PAGINATION LOGIC (Reverse Slice)
        // Since messages are pushed to the end, Page 1 means the LAST 20 items.
        const totalMessages = conversation.message.length;
        
        // Calculate where to stop reading (End Index)
        const endIndex = totalMessages - ((page - 1) * limit);
        
        // Calculate where to start reading (Start Index)
        const startIndex = Math.max(0, endIndex - limit);

        // If endIndex is 0 or less, it means we have no more old messages
        if (endIndex <= 0) {
            return res.status(200).json({ ...conversation.toObject(), message: [] });
        }

        // Extract only the required chunk of messages
        const paginatedMessages = conversation.message.slice(startIndex, endIndex);

        // 🟢 3. Send Response
        // We use .toObject() to clone the doc and replace the 'message' array with our chunk
        res.status(200).json({
            ...conversation.toObject(),
            message: paginatedMessages
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error while fetching messages' });
    }
};

module.exports = { Register, Login, getUserDetails, uploadProfileImg, verifyEmailOtp, getAllUsers, sendMessage, getMessages, uploadMedia }; 