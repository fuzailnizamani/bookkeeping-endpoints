const { cloudinary, storage } = require('../config/cloudinary');
const Transaction = require('../models/Transaction');
const ErrorResponse = require('../utils/errorResponse');
const multer = require('multer');

// Configure Multer (will use Cloudinary storage)
const upload = multer({ storage });

// @desc    Upload receipt for transaction
// @route   POST /api/upload/receipt
exports.uploadReceipt = [
  upload.single('receipt'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return next(new ErrorResponse('No file uploaded', 400));
      }

      // Example: Attach to a transaction (modify as needed)
      const transaction = await Transaction.findById(req.body.transactionId);
      if (!transaction) {
        // Delete uploaded file if transaction doesn't exist
        await cloudinary.uploader.destroy(req.file.filename);
        return next(new ErrorResponse('Transaction not found', 404));
      }

      // Save receipt info to transaction
      transaction.receipt = {
        public_id: req.file.public_id,
        url: req.file.path
      };
      await transaction.save();

      res.status(200).json({
        success: true,
        data: transaction.receipt
      });
    } catch (err) {
      // Clean up failed upload
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      next(err);
    }
  }
];

// @desc    Get receipt
// @route   GET /api/upload/receipt/:id
exports.getReceipt = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction?.receipt?.url) {
      return next(new ErrorResponse('Receipt not found', 404));
    }

    // Redirect to Cloudinary URL
    res.redirect(transaction.receipt.url);
  } catch (err) {
    next(err);
  }
};