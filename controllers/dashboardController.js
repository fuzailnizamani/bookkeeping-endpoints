const Transaction = require('../models/Transaction');
const Business = require('../models/Business');
const { ErrorResponse } = require('../utils/errorResponse');
const mongoose = require('mongoose');

// @desc    Get key metrics (income, expenses, profit)
// @route   GET /api/dashboard/summary
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const { businessId } = req.query;

    // Validate business access
    const business = await Business.findOne({
      _id: businessId,
      $or: [
        { owner: req.user.id },
        { 'employees.user': req.user.id }
      ]
    });

    if (!business) {
      return next(new ErrorResponse('Not authorized to access this business', 403));
    }

    const transactions = await Transaction.find({ business: businessId });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        totalIncome: income,
        totalExpenses: expenses,
        profit: income - expenses,
        currency: business.currency || 'USD' // Default to USD
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get recent transactions (last 10)
// @route   GET /api/dashboard/recent-transactions
exports.getRecentTransactions = async (req, res, next) => {
  try {
    const { businessId } = req.query;

    const transactions = await Transaction.find({ business: businessId })
      .sort('-date')
      .limit(10)
      .populate('createdBy', 'name')
      .select('-__v');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get chart data (monthly trends)
// @route   GET /api/dashboard/chart-data
exports.getChartData = async (req, res, next) => {
  try {
    const { businessId, year = new Date().getFullYear() } = req.query;

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          business:  new mongoose.Types.ObjectId(businessId),
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $group: {
          _id: "$_id.month",
          income: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          income: 1,
          expenses: 1,
          profit: { $subtract: ["$income", "$expenses"] }
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Fill in missing months with zeros
    const completeData = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyData.find(d => d.month === i + 1);
      return monthData || {
        month: i + 1,
        income: 0,
        expenses: 0,
        profit: 0
      };
    });

    res.status(200).json({
      success: true,
      data: completeData
    });
  } catch (err) {
    next(err);
  }
};