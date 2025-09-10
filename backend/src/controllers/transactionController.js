const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');

// Get all transactions with pagination and filtering
const getAllTransactions = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = 'payment_time',
            order = 'desc',
            status,
            school_id,
            date_from,
            date_to,
            search
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build match conditions
        const matchConditions = {};

        if (status) {
            matchConditions['order_status.status'] = status;
        }

        if (school_id) {
            matchConditions.school_id = school_id;
        }

        if (date_from || date_to) {
            matchConditions['order_status.payment_time'] = {};
            if (date_from) {
                matchConditions['order_status.payment_time'].$gte = new Date(date_from);
            }
            if (date_to) {
                matchConditions['order_status.payment_time'].$lte = new Date(date_to);
            }
        }

        if (search) {
            matchConditions.$or = [
                { custom_order_id: { $regex: search, $options: 'i' } },
                { 'student_info.name': { $regex: search, $options: 'i' } },
                { 'student_info.email': { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sortField = sort.includes('order_status.') ? sort : `order_status.${sort}`;
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = { [sortField]: sortOrder };

        // Aggregation pipeline
        const pipeline = [
            {
                $lookup: {
                    from: 'orderstatuses',
                    localField: '_id',
                    foreignField: 'collect_id',
                    as: 'order_status'
                }
            },
            {
                $unwind: {
                    path: '$order_status',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: matchConditions
            },
            {
                $project: {
                    collect_id: '$_id',
                    school_id: 1,
                    custom_order_id: 1,
                    gateway: '$gateway_name',
                    student_info: 1,
                    order_amount: '$order_status.order_amount',
                    transaction_amount: '$order_status.transaction_amount',
                    status: '$order_status.status',
                    payment_mode: '$order_status.payment_mode',
                    payment_time: '$order_status.payment_time',
                    bank_reference: '$order_status.bank_reference',
                    payment_message: '$order_status.payment_message',
                    created_at: 1
                }
            },
            {
                $sort: sortObj
            }
        ];

        // Get total count
        const totalPipeline = [...pipeline, { $count: 'total' }];
        const totalResult = await Order.aggregate(totalPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        // Get paginated results
        const transactions = await Order.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: limitNum }
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    current_page: pageNum,
                    total_pages: totalPages,
                    total_records: total,
                    limit: limitNum,
                    has_next: pageNum < totalPages,
                    has_prev: pageNum > 1
                },
                filters: {
                    status,
                    school_id,
                    date_from,
                    date_to,
                    search,
                    sort,
                    order
                }
            }
        });
    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transactions',
            error: error.message
        });
    }
};

// Get transactions by school
const getTransactionsBySchool = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const {
            page = 1,
            limit = 10,
            sort = 'payment_time',
            order = 'desc',
            status,
            date_from,
            date_to
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build match conditions
        const matchConditions = { school_id: schoolId };

        if (status) {
            matchConditions['order_status.status'] = status;
        }

        if (date_from || date_to) {
            matchConditions['order_status.payment_time'] = {};
            if (date_from) {
                matchConditions['order_status.payment_time'].$gte = new Date(date_from);
            }
            if (date_to) {
                matchConditions['order_status.payment_time'].$lte = new Date(date_to);
            }
        }

        // Build sort object
        const sortField = sort.includes('order_status.') ? sort : `order_status.${sort}`;
        const sortOrder = order === 'desc' ? -1 : 1;
        const sortObj = { [sortField]: sortOrder };

        // Aggregation pipeline
        const pipeline = [
            {
                $lookup: {
                    from: 'orderstatuses',
                    localField: '_id',
                    foreignField: 'collect_id',
                    as: 'order_status'
                }
            },
            {
                $unwind: {
                    path: '$order_status',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: matchConditions
            },
            {
                $project: {
                    collect_id: '$_id',
                    school_id: 1,
                    custom_order_id: 1,
                    gateway: '$gateway_name',
                    student_info: 1,
                    order_amount: '$order_status.order_amount',
                    transaction_amount: '$order_status.transaction_amount',
                    status: '$order_status.status',
                    payment_mode: '$order_status.payment_mode',
                    payment_time: '$order_status.payment_time',
                    bank_reference: '$order_status.bank_reference',
                    payment_message: '$order_status.payment_message',
                    created_at: 1
                }
            },
            {
                $sort: sortObj
            }
        ];

        // Get total count
        const totalPipeline = [...pipeline, { $count: 'total' }];
        const totalResult = await Order.aggregate(totalPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        // Get paginated results
        const transactions = await Order.aggregate([
            ...pipeline,
            { $skip: skip },
            { $limit: limitNum }
        ]);

        const totalPages = Math.ceil(total / limitNum);

        res.json({
            success: true,
            data: {
                transactions,
                school_id: schoolId,
                pagination: {
                    current_page: pageNum,
                    total_pages: totalPages,
                    total_records: total,
                    limit: limitNum,
                    has_next: pageNum < totalPages,
                    has_prev: pageNum > 1
                }
            }
        });
    } catch (error) {
        console.error('Get transactions by school error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching school transactions',
            error: error.message
        });
    }
};

// Check transaction status
const checkTransactionStatus = async (req, res) => {
    try {
        const { custom_order_id } = req.params;

        const order = await Order.findOne({ custom_order_id });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        const orderStatus = await OrderStatus.findOne({ collect_id: order._id });

        res.json({
            success: true,
            data: {
                custom_order_id,
                status: orderStatus?.status || 'pending',
                order_amount: orderStatus?.order_amount || order.order_amount,
                transaction_amount: orderStatus?.transaction_amount,
                payment_mode: orderStatus?.payment_mode,
                payment_time: orderStatus?.payment_time,
                payment_message: orderStatus?.payment_message,
                bank_reference: orderStatus?.bank_reference,
                student_info: order.student_info,
                school_id: order.school_id,
                gateway: order.gateway_name,
                created_at: order.created_at
            }
        });
    } catch (error) {
        console.error('Check transaction status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking transaction status',
            error: error.message
        });
    }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
    try {
        const { school_id, date_from, date_to } = req.query;

        const matchConditions = {};

        if (school_id) {
            matchConditions.school_id = school_id;
        }

        if (date_from || date_to) {
            matchConditions['order_status.payment_time'] = {};
            if (date_from) {
                matchConditions['order_status.payment_time'].$gte = new Date(date_from);
            }
            if (date_to) {
                matchConditions['order_status.payment_time'].$lte = new Date(date_to);
            }
        }

        const stats = await Order.aggregate([
            {
                $lookup: {
                    from: 'orderstatuses',
                    localField: '_id',
                    foreignField: 'collect_id',
                    as: 'order_status'
                }
            },
            {
                $unwind: {
                    path: '$order_status',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: matchConditions
            },
            {
                $group: {
                    _id: null,
                    total_transactions: { $sum: 1 },
                    total_amount: { $sum: '$order_status.transaction_amount' },
                    successful_transactions: {
                        $sum: { $cond: [{ $eq: ['$order_status.status', 'success'] }, 1, 0] }
                    },
                    failed_transactions: {
                        $sum: { $cond: [{ $eq: ['$order_status.status', 'failed'] }, 1, 0] }
                    },
                    pending_transactions: {
                        $sum: { $cond: [{ $eq: ['$order_status.status', 'pending'] }, 1, 0] }
                    },
                    successful_amount: {
                        $sum: {
                            $cond: [
                                { $eq: ['$order_status.status', 'success'] },
                                '$order_status.transaction_amount',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const result = stats.length > 0 ? stats[0] : {
            total_transactions: 0,
            total_amount: 0,
            successful_transactions: 0,
            failed_transactions: 0,
            pending_transactions: 0,
            successful_amount: 0
        };

        // Calculate success rate
        result.success_rate = result.total_transactions > 0
            ? ((result.successful_transactions / result.total_transactions) * 100).toFixed(2)
            : 0;

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get transaction stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction statistics',
            error: error.message
        });
    }
};

module.exports = {
    getAllTransactions,
    getTransactionsBySchool,
    checkTransactionStatus,
    getTransactionStats
};
