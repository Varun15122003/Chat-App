const express = require('express');
const router = express.Router();
const {Register, Login, getUserDetails, uploadProfileImg, verifyEmailOtp, getAllUsers} = require('../controllers/authControllers');
const upload = require('../middlewares/multer');

router.post('/register', Register);
router.post('/login', Login);
router.get('/getUserDetails', getUserDetails);
router.post('/uploadProfileImg', upload.single('file'), uploadProfileImg); 
router.post('/verifyEmailOtp', verifyEmailOtp);
router.get('/getAllUsers', getAllUsers);


module.exports = router; 