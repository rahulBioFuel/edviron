const express = require('express');
const {
    validateCreatePayment,
    validateWebhook
} = require('../middleware/validation');
const {
    createPayment,
    verifyPayment,
    handleWebhook,
    getPaymentDetails
} = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/create-payment', auth, validateCreatePayment, createPayment);
router.post('/verify-payment', auth, verifyPayment);
router.get('/details/:order_id', auth, getPaymentDetails);

// Public webhook route (no auth required for webhooks)
router.post('/webhook', validateWebhook, handleWebhook);

module.exports = router;
