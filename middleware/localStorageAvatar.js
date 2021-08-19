const multer = require("multer");
const storage = multer.memoryStorage();

/* if(path.extname(file.originalname) !== '.csv') {
                return callback(new Error('Only csv files allowed!')); */

const uploads = multer({
    storage: storage,
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith("image/");
        if (isPhoto) {
            next(null, true);
        } else {
            next("Image Files Only", false);
        }
    },
});

module.exports = uploads;
