const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dt21u7bqg',
    api_key: '738575851147461',
    api_secret: 'MAWx81TUs2haP9_ws7oU6YJT4r0' // Click 'View API Keys' above to copy your API secret
});

module.exports = cloudinary;