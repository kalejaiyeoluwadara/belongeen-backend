const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "belongeen", // Folder name in Cloudinary
    allowed_formats: ["jpeg", "jpg", "png"],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
