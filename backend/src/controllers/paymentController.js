const Razorpay = require('razorpay');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');
const WebhookLog = require('../models/WebhookLog');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create payment order
const createPayment = async (req, res) => {
    try {
        const { school_id, trustee_id, student_info, order_amount, currency = 'INR' } = req.body;

        // Generate custom order ID
        const custom_order_id = `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create order in our database
        const order = new Order({
            school_id,
            trustee_id,
            student_info,
            gateway_name: 'razorpay',
            custom_order_id,
            order_amount,
            currency
        });

        await order.save();

        // Create Razorpay order
        const razorpayOrderOptions = {
            amount: order_amount * 100, // Razorpay expects amount in paisa
            currency,
            receipt: custom_order_id,
            notes: {
                school_id,
                student_id: student_info.id,
                student_name: student_info.name,
                custom_order_id
            }
        };

        const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);

        // Create initial order status entry
        const orderStatus = new OrderStatus({
            collect_id: order._id,
            order_amount,
            transaction_amount: order_amount,
            payment_mode: 'pending',
            payment_details: 'Payment initiated',
            bank_reference: 'pending',
            payment_message: 'Payment order created',
            status: 'pending',
            razorpay_order_id: razorpayOrder.id
        });

        await orderStatus.save();

        // Generate JWT payload for frontend
        const jwtPayload = {
            order_id: custom_order_id,
            amount: order_amount,
            currency,
            school_id,
            student_info,
            razorpay_order_id: razorpayOrder.id,
            created_at: new Date()
        };

        const paymentToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            success: true,
            message: 'Payment order created successfully',
            data: {
                order_id: custom_order_id,
                razorpay_order_id: razorpayOrder.id,
                amount: order_amount,
                currency,
                key_id: process.env.RAZORPAY_KEY_ID,
                payment_token: paymentToken,
                student_info,
                redirect_url: `${process.env.FRONTEND_URL}/payment/${custom_order_id}`,
                checkout_url: `${process.env.FRONTEND_URL}/checkout?token=${paymentToken}`
            }
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating payment order',
            error: error.message
        });
    }
};

// Verify payment
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, custom_order_id } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (!isSignatureValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        // Find order
        const order = await Order.findOne({ custom_order_id });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Fetch payment details from Razorpay
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        // Update order status
        await OrderStatus.findOneAndUpdate(
            { collect_id: order._id },
            {
                payment_mode: payment.method,
                payment_details: payment.email || payment.contact || 'success',
                bank_reference: payment.bank || 'RAZORPAY',
                payment_message: 'Payment successful',
                status: 'success',
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
                transaction_amount: payment.amount / 100,
                payment_time: new Date(),
                updated_at: new Date()
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                order_id: custom_order_id,
                payment_id: razorpay_payment_id,
                status: 'success'
            }
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
};

// Handle webhook
const handleWebhook = async (req, res) => {
    try {
        const { status, order_info } = req.body;
        const webhookPayload = req.body;

        // Log webhook
        const webhookLog = new WebhookLog({
            event_type: 'payment_update',
            payload: webhookPayload,
            status: 'processed',
            order_id: order_info.order_id,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });

        try {
            // Find order by custom_order_id or collect_id
            let order;
            if (order_info.order_id.startsWith('ORD_')) {
                order = await Order.findOne({ custom_order_id: order_info.order_id });
            } else {
                order = await Order.findById(order_info.order_id);
            }

            if (!order) {
                webhookLog.status = 'failed';
                webhookLog.error_message = 'Order not found';
                await webhookLog.save();

                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Update order status
            const updateData = {
                order_amount: order_info.order_amount,
                transaction_amount: order_info.transaction_amount,
                payment_mode: order_info.payment_mode,
                payment_details: order_info.payment_details || order_info.payemnt_details, // Handle typo in payload
                bank_reference: order_info.bank_reference,
                payment_message: order_info.Payment_message || order_info.payment_message,
                status: order_info.status,
                error_message: order_info.error_message || 'NA',
                payment_time: new Date(order_info.payment_time),
                updated_at: new Date()
            };

            const orderStatus = await OrderStatus.findOneAndUpdate(
                { collect_id: order._id },
                updateData,
                { new: true, upsert: true }
            );

            webhookLog.status = 'success';
            await webhookLog.save();

            res.json({
                success: true,
                message: 'Webhook processed successfully',
                data: { order_status: orderStatus }
            });
        } catch (error) {
            webhookLog.status = 'failed';
            webhookLog.error_message = error.message;
            await webhookLog.save();
            throw error;
        }
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing webhook',
            error: error.message
        });
    }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
    try {
        const { order_id } = req.params;

        const order = await Order.findOne({ custom_order_id: order_id });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const orderStatus = await OrderStatus.findOne({ collect_id: order._id });

        res.json({
            success: true,
            data: {
                order,
                order_status: orderStatus
            }
        });
    } catch (error) {
        console.error('Get payment details error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment details',
            error: error.message
        });
    }
};

module.exports = {
    createPayment,
    verifyPayment,
    handleWebhook,
    getPaymentDetails
};
