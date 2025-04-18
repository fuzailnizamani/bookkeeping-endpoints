const Transaction = require('../models/Transaction');
const ErrorResponse  = require('../utils/errorResponse');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

// @desc    Get profit/loss report
// @route   GET /api/reports/profit-loss
exports.getProfitLossReport = async (req, res, next) => {
  try {
    const { businessId, startDate, endDate } = req.query;

    const transactions = await Transaction.find({
      business: businessId,
      date: { 
        $gte: new Date(startDate || '1970-01-01'), 
        $lte: new Date(endDate || Date.now()) 
      }
    });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const profit = income - expenses;

    res.status(200).json({
      success: true,
      data: {
        period: { startDate, endDate },
        income,
        expenses,
        profit,
        transactionCount: transactions.length
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get cash flow statement (PDF/CSV)
// @route   GET /api/reports/cash-flow
exports.getCashFlowStatement = async (req, res, next) => {
  try {
    const { businessId, format = 'json' } = req.query;
    const transactions = await Transaction.find({ business: businessId });

    // Format data
    const cashFlowData = transactions.map(t => ({
      date: t.date.toISOString().split('T')[0],
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category
    }));

    // Handle different formats
    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=cash-flow.pdf');
      
      doc.pipe(res);
      doc.fontSize(18).text('Cash Flow Statement', { align: 'center' });
      doc.moveDown();
      
      cashFlowData.forEach(t => {
        doc.fontSize(10)
          .text(`${t.date} | ${t.description} | ${t.type.toUpperCase()} | $${t.amount}`);
      });
      
      doc.end();
    } 
    else if (format === 'csv') {
      const parser = new Parser();
      const csv = parser.parse(cashFlowData);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=cash-flow.csv');
      res.send(csv);
    } 
    else {
      res.status(200).json({ success: true, data: cashFlowData });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get expense breakdown by category
// @route   GET /api/reports/expense-breakdown
exports.getExpenseBreakdown = async (req, res, next) => {
  try {
    const { businessId } = req.query;
    
    const expenses = await Transaction.aggregate([
      { 
        $match: { 
          business: mongoose.Types.ObjectId(businessId),
          type: 'expense' 
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: expenses.map(item => ({
        category: item._id,
        total: item.total,
        percentage: (item.total / expenses.reduce((sum, e) => sum + e.total, 0)) * 100
      }))
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get income breakdown by category
// @route   GET /api/reports/income-breakdown
exports.getIncomeBreakdown = async (req, res, next) => {
  try {
    const { businessId } = req.query;
    
    const income = await Transaction.aggregate([
      { 
        $match: { 
          business: mongoose.Types.ObjectId(businessId),
          type: 'income' 
        } 
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: income
    });
  } catch (err) {
    next(err);
  }
};