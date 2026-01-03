const express = require('express');
const router = express.Router();
const { sendMessage, getMessages,uploadMedia } = require('../controllers/authControllers');
const upload = require('../middlewares/multer');

router.post('/sendMessage', sendMessage);
router.get('/:userOneId/:userTwoId', getMessages);
router.post('/uploadMedia', upload.single('media'), uploadMedia);

module.exports = router;