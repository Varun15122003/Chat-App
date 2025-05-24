const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, } = require('../controllers/authControllers');

router.post('/sendMessage', sendMessage);
router.get('/:userOneId/:userTwoId', getMessages);

module.exports = router;