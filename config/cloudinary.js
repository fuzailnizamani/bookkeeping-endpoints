const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'bookkeeping-receipts',
    public_id: file.fieldname + '-' + Date.now(),
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    resource_type: file.mimetype.startsWith('image') ? 'image' : 'raw',
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }),
});

module.exports = {
  cloudinary,
  storage
};
