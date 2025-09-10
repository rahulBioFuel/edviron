const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    school_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    trustee_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    student_info: {
        name: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true
        }
    },
    gateway_name: {
        type: String,
        required: true,
        default: 'razorpay'
    },
    custom_order_id: {
        type: String,
        required: true,
        unique: true
    },
    order_amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
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

// Add index for better query performance
orderSchema.index({ school_id: 1 });
orderSchema.index({ custom_order_id: 1 });
orderSchema.index({ created_at: -1 });

module.exports = mongoose.model('Order', orderSchema);
