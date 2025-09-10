const mongoose = require('mongoose');

const webhookLogSchema = new mongoose.Schema({
    event_type: {
        type: String,
        required: true
    },
    payload: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'processed'],
        required: true,
        default: 'processed'
    },
    order_id: {
        type: String
    },
    razorpay_payment_id: {
        type: String
    },
    error_message: {
        type: String
    },
    processed_at: {
        type: Date,
        default: Date.now
    },
    ip_address: {
        type: String
    },
    user_agent: {
        type: String
    }
});

// Add indexes
webhookLogSchema.index({ event_type: 1 });
webhookLogSchema.index({ processed_at: -1 });
webhookLogSchema.index({ order_id: 1 });

module.exports = mongoose.model('WebhookLog', webhookLogSchema);
