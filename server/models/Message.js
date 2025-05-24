const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    userOne: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userTwo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: [
        {
            text: String,
            time: {
                type: Date,
                default: Date.now,
            },
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            }
        }
    ],



    timestamp: {
        type: Date,
        default: Date.now
    },
    isRead: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Message', messageSchema);
