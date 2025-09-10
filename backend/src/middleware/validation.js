const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// User registration validation
const validateUserRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('role')
        .optional()
        .isIn(['admin', 'school_admin', 'user'])
        .withMessage('Invalid role specified'),

    handleValidationErrors
];

// User login validation
const validateUserLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

// Payment creation validation
const validateCreatePayment = [
    body('school_id')
        .isMongoId()
        .withMessage('Invalid school ID'),

    body('trustee_id')
        .isMongoId()
        .withMessage('Invalid trustee ID'),

    body('student_info.name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Student name must be between 2 and 100 characters'),

    body('student_info.id')
        .trim()
        .notEmpty()
        .withMessage('Student ID is required'),

    body('student_info.email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid student email'),

    body('order_amount')
        .isFloat({ min: 1 })
        .withMessage('Order amount must be a positive number'),

    body('currency')
        .optional()
        .isIn(['INR', 'USD'])
        .withMessage('Currency must be INR or USD'),

    handleValidationErrors
];

// Webhook validation
const validateWebhook = [
    body('status')
        .isInt()
        .withMessage('Status must be a number'),

    body('order_info')
        .isObject()
        .withMessage('Order info must be an object'),

    body('order_info.order_id')
        .notEmpty()
        .withMessage('Order ID is required'),

    body('order_info.order_amount')
        .isFloat({ min: 0 })
        .withMessage('Order amount must be a valid number'),

    body('order_info.transaction_amount')
        .isFloat({ min: 0 })
        .withMessage('Transaction amount must be a valid number'),

    body('order_info.status')
        .isIn(['success', 'failed', 'pending', 'cancelled'])
        .withMessage('Invalid status'),

    handleValidationErrors
];

// Query validation for transactions
const validateTransactionQuery = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('sort')
        .optional()
        .isIn(['payment_time', 'order_amount', 'status', 'created_at'])
        .withMessage('Invalid sort field'),

    query('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Order must be asc or desc'),

    query('status')
        .optional()
        .isIn(['success', 'failed', 'pending', 'cancelled'])
        .withMessage('Invalid status filter'),

    handleValidationErrors
];

// School ID parameter validation
const validateSchoolId = [
    param('schoolId')
        .isMongoId()
        .withMessage('Invalid school ID format'),

    handleValidationErrors
];

// Custom order ID parameter validation
const validateCustomOrderId = [
    param('custom_order_id')
        .trim()
        .notEmpty()
        .withMessage('Custom order ID is required'),

    handleValidationErrors
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateCreatePayment,
    validateWebhook,
    validateTransactionQuery,
    validateSchoolId,
    validateCustomOrderId,
    handleValidationErrors
};
