const Transaction = require('../models/Transaction');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Add new transaction
// @route   POST /api/transactions/add
exports.addTransaction = async (req, res, next) => {
  try {
    const { description, amount, type, category, businessId } = req.body;

    const transaction = await Transaction.create({
      description,
      amount,
      type,
      category,
      business: businessId,
      createdBy: req.user.id,
    });

    // Create notification
    await createNotification({
      userId: req.user.id,
      message: `New ${transaction.type} added: $${transaction.amount}`,
      type: 'transaction',
      relatedEntityId: transaction._id,
      onModel: 'Transaction'
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all transactions (with filters)
// @route   GET /api/transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const { businessId, type, startDate, endDate } = req.query;
    const filters = { business: businessId };

    if (type) filters.type = type;
    if (startDate && endDate) {
      filters.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const transactions = await Transaction.find(filters)
      .sort('-date')
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('business', 'name');

    if (!transaction) {
      return next(new ErrorResponse('Transaction not found', 404));
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
exports.updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return next(new ErrorResponse('Transaction not found', 404));
    }

    // Verify ownership (or business admin role)
    if (transaction.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update', 401));
    }

    transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return next(new ErrorResponse('Transaction not found', 404));
    }

    // Verify ownership
    if (transaction.createdBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete', 401));
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get summary (daily/weekly/monthly)
// @route   GET /api/transactions/summary
exports.getSummary = async (req, res, next) => {
  try {
    const { businessId, period } = req.query; // period: 'day', 'week', 'month'
    const dateFilter = {};

    // Set date range based on period
    const now = new Date();
    switch (period) {
      case 'day':
        dateFilter.$gte = new Date(now.setHours(0, 0, 0, 0));
        dateFilter.$lte = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'week':
        dateFilter.$gte = new Date(now.setDate(now.getDate() - 7));
        dateFilter.$lte = new Date();
        break;
      case 'month':
        dateFilter.$gte = new Date(now.setMonth(now.getMonth() - 1));
        dateFilter.$lte = new Date();
        break;
      default:
        dateFilter.$gte = new Date(now.setFullYear(now.getFullYear() - 1));
        dateFilter.$lte = new Date();
    }

    const transactions = await Transaction.find({
      business: businessId,
      date: dateFilter,
    });

    const summary = {
      totalIncome: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      profit: 0, // Calculated below
      count: transactions.length,
    };
    summary.profit = summary.totalIncome - summary.totalExpenses;

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
};