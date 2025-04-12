const Business = require('../models/Business');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
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

// @desc    Invite employee
// @route   POST /api/business/invite
exports.inviteEmployee = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const business = await Business.findById(req.params.businessId);

    // Check if user is the business owner
    if (business.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    // Find user by email
    const employee = await User.findOne({ email });
    if (!employee) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Add to employees array
    business.employees.push({
      user: employee._id,
      role,
      status: 'pending',
    });
    await business.save();

    // In production: Send email invitation
    console.log(`Invitation sent to ${email}`);

    res.status(200).json({
      success: true,
      message: 'Invitation sent',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all employees of a business
// @route   GET /api/business/:businessId/employees
exports.getEmployees = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.businessId)
      .populate({
        path: 'employees.user',
        select: 'name email avatar', // Only return these fields
      });

    if (!business) {
      return next(new ErrorResponse('Business not found', 404));
    }

    // Check if user is part of this business
    const isEmployee = business.employees.some(
      emp => emp.user._id.toString() === req.user.id
    );
    if (!isEmployee) {
      return next(new ErrorResponse('Not authorized', 401));
    }

    res.status(200).json({
      success: true,
      count: business.employees.length,
      data: business.employees,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept/reject invitation
// @route   PUT /api/business/invite/:action (action = accept/reject)
exports.handleInvitation = async (req, res, next) => {
  try {
    const { businessId, action } = req.body;

    console.log("Action:", action);
    console.log("Business ID:", businessId);
    console.log("Current User ID:", req.user.id);

    const business = await Business.findById(businessId);

    if (!business) {
      return next(new ErrorResponse('Business not found', 404));
    }

    console.log(req.originalUrl)

    // Debug current employee list
    console.log("Employees:", business.employees.map(e => ({
      user: e.user?.toString(),
      status: e.status
    })));

    // Find the employee's invitation
    const employeeIndex = business.employees.findIndex(
      emp => emp.user.toString() === req.user.id && emp.status === 'pending'
    );

    console.log("Employee user IDs:", business.employees.map(e => e.user.toString()));
    console.log("Current user ID:", req.user.id);

    console.log("Action:", action); // should be 'accept' or 'reject'
    console.log("businessId:", businessId); // should not be undefined


    if (employeeIndex === -1) {
      return next(new ErrorResponse('No pending invitation found', 400));
    }

    // Update status
    business.employees[employeeIndex].status = action === 'accept' ? 'accepted' : 'rejected';
    await business.save();

    // If accepted, add business to user's businesses array
    if (action === 'accept') {
      await User.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { businesses: business._id } }
      );
    }

    res.status(200).json({
      success: true,
      message: `Invitation ${action}ed`,
    });
  } catch (err) {
    next(err);
  }
};