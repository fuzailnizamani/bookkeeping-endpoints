const Business = require('../models/Business');

// @desc    Create a business
// @route   POST /api/business
exports.createBusiness = async (req, res, next) => {
  try {
    const { name } = req.body;

    const business = await Business.create({
      name,
      owner: req.user.id,
      employees: [{
        user: req.user.id,
        role: 'admin',
        status: 'accepted',
      }],
    });

    // Add business to user's businesses array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { businesses: business._id } }
    );

    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};