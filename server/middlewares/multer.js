const multer = require('multer');
const path = require('path');

// Set storage engine for custom filenames
const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, 'uploads/'); // Upload folder
    // },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now(); // Unique timestamp
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

module.exports = upload;


//  cloudinary


