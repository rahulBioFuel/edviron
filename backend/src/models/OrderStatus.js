const mongoose = require('mongoose');

const orderStatusSchema = new mongoose.Schema({
    collect_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    order_amount: {
        type: Number,
        required: true
    },
    transaction_amount: {
        type: Number,
        required: true
    },
    payment_mode: {
        type: String,
        enum: ['upi', 'card', 'netbanking', 'wallet', 'bank_transfer'],
        required: true
    },
    payment_details: {
        type: String,
        required: true
    },
    bank_reference: {
        type: String,
        required: true
    },
    payment_message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending', 'cancelled'],
        required: true,
        default: 'pending'
    },
    error_message: {
        type: String,
        default: 'NA'
    },
    payment_time: {
        type: Date,
        required: true,
        default: Date.now
    },
    razorpay_payment_id: {
        type: String
    },
    razorpay_order_id: {
        type: String
    },
    razorpay_signature: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
orderStatusSchema.index({ collect_id: 1 });
orderStatusSchema.index({ status: 1 });
orderStatusSchema.index({ payment_time: -1 });

module.exports = mongoose.model('OrderStatus', orderStatusSchema);
