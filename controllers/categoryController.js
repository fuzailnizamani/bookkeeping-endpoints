const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a category
// @route   POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    // Check if category already exists for this business
    const existingCategory = await Category.findOne({
      name,
      business: req.body.businessId
    });

    if (existingCategory) {
      return next(new ErrorResponse(`Category '${name}' already exists`, 400));
    }

    const category = await Category.create({
      name,
      type,
      business: req.body.businessId,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all categories for a business
// @route   GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ 
      business: req.query.businessId 
    }).populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }

    // Verify ownership or admin role
    if (
      category.createdBy.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return next(new ErrorResponse('Not authorized to delete this category', 401));
    }

    // Prevent deletion if used in transactions
    const transactionsCount = await Transaction.countDocuments({ 
      category: category.name,
      business: category.business
    });

    if (transactionsCount > 0) {
      return next(new ErrorResponse(
        'Cannot delete category with existing transactions', 
        400
      ));
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};