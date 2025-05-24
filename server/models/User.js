const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    profileImage: {
        type: String,
        default: 'https://img.freepik.com/premium-photo/profile-icon-white-background_941097-161207.jpg'
    },

    isVerifiedAccount: {
        type: Boolean,
        default: false,
    },
    friendLists: {
        type: Array,
        default: [],
    },


})

const User = mongoose.model('user', UserSchema);

module.exports = User;