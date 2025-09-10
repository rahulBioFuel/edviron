const express = require('express');
const {
    validateTransactionQuery,
    validateSchoolId,
    validateCustomOrderId
} = require('../middleware/validation');
const {
    getAllTransactions,
    getTransactionsBySchool,
    checkTransactionStatus,
    getTransactionStats
} = require('../controllers/transactionController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// All transaction routes require authentication
router.use(auth);

// Get all transactions with filtering and pagination
router.get('/', validateTransactionQuery, getAllTransactions);

// Get transaction statistics
router.get('/stats', getTransactionStats);

// Get transactions by school
router.get('/school/:schoolId', validateSchoolId, validateTransactionQuery, getTransactionsBySchool);

// Check transaction status by custom order ID
router.get('/status/:custom_order_id', validateCustomOrderId, checkTransactionStatus);

module.exports = router;
