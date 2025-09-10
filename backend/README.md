# School Payment Backend API

A comprehensive Node.js/Express backend API for managing school payments and transactions with Razorpay integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access
- **Payment Integration**: Razorpay payment gateway integration (replacing Cashfree)
- **Transaction Management**: Complete CRUD operations for orders and transactions
- **Webhook Support**: Handle payment status updates via webhooks
- **Data Validation**: Comprehensive input validation and sanitization
- **Security**: Rate limiting, CORS, helmet, and security best practices
- **Database**: MongoDB with Mongoose ODM
- **Logging**: Structured logging with Morgan
- **Error Handling**: Centralized error handling and custom error responses

## 📋 Requirements

- Node.js (v16 or higher)
- MongoDB Atlas account
- Razorpay account (for payment processing)

## 🛠️ Installation & Setup

### 1. Clone and Navigate
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory with the following variables:

```env
# Environment
NODE_ENV=development
PORT=5000

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_payment_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Original API Credentials (for reference)
PG_KEY=edvtest01
API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0
SCHOOL_ID=65b0e6293e9f76a9694d84b4

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 4. Start the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📊 Database Schemas

### Order Schema
```javascript
{
  _id: ObjectId,
  school_id: ObjectId,
  trustee_id: ObjectId,
  student_info: {
    name: String,
    id: String,
    email: String
  },
  gateway_name: String,
  custom_order_id: String,
  order_amount: Number,
  currency: String,
  created_at: Date,
  updated_at: Date
}
```

### Order Status Schema
```javascript
{
  _id: ObjectId,
  collect_id: ObjectId (Reference to Order),
  order_amount: Number,
  transaction_amount: Number,
  payment_mode: String,
  payment_details: String,
  bank_reference: String,
  payment_message: String,
  status: String,
  error_message: String,
  payment_time: Date,
  razorpay_payment_id: String,
  razorpay_order_id: String,
  razorpay_signature: String,
  created_at: Date,
  updated_at: Date
}
```

### Webhook Logs Schema
```javascript
{
  _id: ObjectId,
  event_type: String,
  payload: Mixed,
  status: String,
  order_id: String,
  razorpay_payment_id: String,
  error_message: String,
  processed_at: Date,
  ip_address: String,
  user_agent: String
}
```

### User Schema
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  role: String,
  school_id: ObjectId,
  is_active: Boolean,
  last_login: Date,
  created_at: Date,
  updated_at: Date
}
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "user",
  "school_id": "65b0e6293e9f76a9694d84b4"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

### Payment Routes (`/api/payment`)

#### Create Payment (Protected)
```http
POST /api/payment/create-payment
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "trustee_id": "65b0e5529d31950a9b41c5ba",
  "student_info": {
    "name": "John Doe",
    "id": "ST001",
    "email": "john.student@example.com"
  },
  "order_amount": 5000,
  "currency": "INR"
}
```

#### Verify Payment (Protected)
```http
POST /api/payment/verify-payment
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "razorpay_order_id": "order_xxxxx",
  "razorpay_payment_id": "pay_xxxxx",
  "razorpay_signature": "signature_xxxxx",
  "custom_order_id": "ORD_1234567890_abcdef"
}
```

#### Webhook (Public)
```http
POST /api/payment/webhook
Content-Type: application/json

{
  "status": 200,
  "order_info": {
    "order_id": "ORD_1234567890_abcdef",
    "order_amount": 5000,
    "transaction_amount": 5000,
    "gateway": "Razorpay",
    "bank_reference": "RAZORPAY_REF",
    "status": "success",
    "payment_mode": "upi",
    "payment_details": "success@upi",
    "Payment_message": "payment success",
    "payment_time": "2024-01-15T10:30:00.000Z",
    "error_message": "NA"
  }
}
```

### Transaction Routes (`/api/transactions`) - All Protected

#### Get All Transactions
```http
GET /api/transactions?page=1&limit=10&sort=payment_time&order=desc&status=success&school_id=65b0e6293e9f76a9694d84b4
Authorization: Bearer <jwt_token>
```

#### Get Transactions by School
```http
GET /api/transactions/school/65b0e6293e9f76a9694d84b4?page=1&limit=10
Authorization: Bearer <jwt_token>
```

#### Check Transaction Status
```http
GET /api/transactions/status/ORD_1234567890_abcdef
Authorization: Bearer <jwt_token>
```

#### Get Transaction Statistics
```http
GET /api/transactions/stats?school_id=65b0e6293e9f76a9694d84b4&date_from=2024-01-01&date_to=2024-01-31
Authorization: Bearer <jwt_token>
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation using express-validator
- **Password Hashing**: Bcrypt for secure password storage
- **CORS Protection**: Configured CORS policies
- **Helmet**: Security headers middleware
- **Data Sanitization**: Input sanitization to prevent injection attacks

## 🧪 Testing

### Using Postman

1. Import the provided Postman collection (if available)
2. Set up environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: JWT token received from login

### Test User Credentials
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

## 📝 Sample Data

### Create Sample User
```javascript
// Register a test user
POST /api/auth/register
{
  "username": "test_admin",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Create Sample Order
```javascript
// After authentication, create a test payment
POST /api/payment/create-payment
{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "trustee_id": "65b0e5529d31950a9b41c5ba",
  "student_info": {
    "name": "Test Student",
    "id": "ST001",
    "email": "student@example.com"
  },
  "order_amount": 1000
}
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
RAZORPAY_KEY_ID=your_production_razorpay_key
RAZORPAY_KEY_SECRET=your_production_razorpay_secret
FRONTEND_URL=your_production_frontend_url
```

### Deployment Platforms
- **Heroku**: `git push heroku main`
- **AWS**: Use AWS Elastic Beanstalk or EC2
- **Vercel**: Deploy with Vercel CLI
- **Railway**: Connect GitHub repository

## 📈 Performance & Scalability

- **Database Indexing**: Proper indexes on frequently queried fields
- **Pagination**: All list endpoints support pagination
- **Sorting**: Flexible sorting options
- **Aggregation**: MongoDB aggregation pipelines for complex queries
- **Connection Pooling**: MongoDB connection pooling for better performance

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MongoDB URI in `.env`
   - Ensure IP whitelist includes your server IP

2. **Razorpay Integration Issues**
   - Verify API keys in `.env`
   - Check webhook URL configuration

3. **Authentication Errors**
   - Ensure JWT_SECRET is properly set
   - Check token expiry settings

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Create an issue in the repository

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
