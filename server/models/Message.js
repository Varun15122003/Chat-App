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
            text: {
                type: String,
            },
            // 🔹 NEW: image / video URL
            mediaUrl: {
                type: String
            },

            // 🔹 NEW: message type
            messageType: {
                type: String,
                enum: ['text', 'image', 'video', 'document', 'audio', 'pdf'],
                default: 'text'
            },

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
