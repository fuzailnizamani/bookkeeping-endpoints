const Business = require('../models/Business');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('../utils/notificationHelper');

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

    // Create notification for invited employee
    await createNotification({
      userId: employee._id,
      message: `You've been invited to ${business.name}`,
      type: 'invite',
      relatedEntityId: business._id,
      onModel: 'Business'
    });

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
    const business = await Business.findById(businessId);

    if (!business) {
      return next(new ErrorResponse('Business not found', 404));
    }

    // Find the employee's invitation
    const employeeIndex = business.employees.findIndex(
      emp => emp.user.toString() === req.user.id && emp.status === 'pending'
    );

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

// @desc    Get business details for the owner
// @route   GET /api/business/my-business
exports.getMyBusiness = async (req, res, next) => {
  try {
    const business = await Business.find({ owner: req.user.id })
      .populate('employees.user', 'name email role');

    if (!business) {
      return next(new ErrorResponse('No business found for this user', 404));
    }

    res.status(200).json({
      success: true,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};


// @desc    Remove employee
// @route   DELETE /api/business/employees/:employeeId
exports.removeEmployee = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return next(new ErrorResponse('Business not found', 404));
    }

    // Filter out the employee
    business.employees = business.employees.filter(
      emp => emp.user.toString() !== req.params.employeeId
    );

    await business.save();

    // Optional: Remove business from user's businesses array
    await User.findByIdAndUpdate(
      req.params.employeeId,
      { $pull: { businesses: business._id } }
    );

    res.status(200).json({
      success: true,
      message: 'Employee removed',
    });
  } catch (err) {
    next(err);
  }
};