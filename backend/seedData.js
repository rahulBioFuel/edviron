require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./src/models/User');
const Order = require('./src/models/Order');
const OrderStatus = require('./src/models/OrderStatus');

// Sample data
const sampleUsers = [
    {
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
    },
    {
        username: 'school_admin',
        email: 'school@example.com',
        password: 'password123',
        role: 'school_admin',
        school_id: new mongoose.Types.ObjectId('65b0e6293e9f76a9694d84b4')
    },
    {
        username: 'user1',
        email: 'user@example.com',
        password: 'password123',
        role: 'user'
    }
];

const sampleOrders = [
    {
        school_id: new mongoose.Types.ObjectId('65b0e6293e9f76a9694d84b4'),
        trustee_id: new mongoose.Types.ObjectId('65b0e5529d31950a9b41c5ba'),
        student_info: {
            name: 'John Doe',
            id: 'ST001',
            email: 'john.student@example.com'
        },
        gateway_name: 'razorpay',
        custom_order_id: 'ORD_1703248751_demo001',
        order_amount: 5000,
        currency: 'INR'
    },
    {
        school_id: new mongoose.Types.ObjectId('65b0e6293e9f76a9694d84b4'),
        trustee_id: new mongoose.Types.ObjectId('65b0e5529d31950a9b41c5ba'),
        student_info: {
            name: 'Jane Smith',
            id: 'ST002',
            email: 'jane.student@example.com'
        },
        gateway_name: 'razorpay',
        custom_order_id: 'ORD_1703248752_demo002',
        order_amount: 3000,
        currency: 'INR'
    },
    {
        school_id: new mongoose.Types.ObjectId('65b0e6293e9f76a9694d84b4'),
        trustee_id: new mongoose.Types.ObjectId('65b0e5529d31950a9b41c5ba'),
        student_info: {
            name: 'Bob Johnson',
            id: 'ST003',
            email: 'bob.student@example.com'
        },
        gateway_name: 'razorpay',
        custom_order_id: 'ORD_1703248753_demo003',
        order_amount: 7500,
        currency: 'INR'
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_payment_db');
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Order.deleteMany({});
        await OrderStatus.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Seed users
        const users = await User.insertMany(sampleUsers);
        console.log(`👥 Created ${users.length} users`);

        // Seed orders
        const orders = await Order.insertMany(sampleOrders);
        console.log(`📋 Created ${orders.length} orders`);

        // Seed order statuses
        const orderStatuses = orders.map((order, index) => ({
            collect_id: order._id,
            order_amount: order.order_amount,
            transaction_amount: order.order_amount,
            payment_mode: ['upi', 'card', 'netbanking'][index % 3],
            payment_details: ['success@upi', 'card****1234', 'HDFC Bank'][index % 3],
            bank_reference: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            payment_message: index % 3 === 0 ? 'Payment successful' : index % 3 === 1 ? 'Payment failed' : 'Payment pending',
            status: ['success', 'failed', 'pending'][index % 3],
            payment_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time within last week
        }));

        await OrderStatus.insertMany(orderStatuses);
        console.log(`💳 Created ${orderStatuses.length} order statuses`);

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 Sample login credentials:');
        console.log('Admin: admin@example.com / password123');
        console.log('School Admin: school@example.com / password123');
        console.log('User: user@example.com / password123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run seeder if called directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
