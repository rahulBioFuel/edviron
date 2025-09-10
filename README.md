# School Payment & Dashboard Application

A full-stack payment management system for schools with Razorpay integration, built with Express.js backend and React.js frontend.

## 🏗️ Project Overview

This project implements a comprehensive school payment management system that replaces Cashfree with Razorpay for payment processing. The application consists of a robust backend API and a modern React frontend dashboard.

### 🎯 Assignment Completion

**✅ Part 1 - Backend Requirements:**
- Express.js backend with MongoDB Atlas
- JWT authentication with user roles
- Complete database schemas (Order, OrderStatus, WebhookLogs, User)
- Razorpay payment gateway integration (replacing Cashfree)
- Webhook handling for payment status updates
- RESTful API endpoints with proper validation
- Transaction aggregation with MongoDB pipelines
- Comprehensive error handling and security measures

**✅ Part 2 - Frontend Requirements:**
- React.js with Vite build tool
- Tailwind CSS for styling
- Responsive dashboard with transaction management
- Advanced table with hover effects (as per reference video)
- Filtering, sorting, and pagination
- Razorpay checkout integration
- Authentication flow with protected routes

## 🏢 Architecture

```
school-payment-app/
├── backend/                 # Express.js API Server
│   ├── src/
│   │   ├── models/         # MongoDB Schemas
│   │   ├── controllers/    # Business Logic
│   │   ├── routes/         # API Routes
│   │   ├── middleware/     # Auth & Validation
│   │   └── config/         # Database Config
│   ├── server.js           # Entry Point
│   └── package.json
│
├── frontend/               # React.js Dashboard
│   ├── src/
│   │   ├── components/     # Reusable Components
│   │   ├── pages/          # Page Components
│   │   ├── services/       # API Services
│   │   ├── context/        # React Context
│   │   ├── hooks/          # Custom Hooks
│   │   └── utils/          # Helper Functions
│   ├── package.json
│   └── vite.config.js
│
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Razorpay account

### 1. Clone Repository
```bash
git clone <repository-url>
cd edviron
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Start backend server
npm run dev
```
Backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API URL

# Start frontend development server
npm run dev
```
Frontend will run on `http://localhost:5173`

## 🔧 Configuration

### Backend Environment Variables
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## 📊 Key Features

### Payment Gateway Integration
- **Razorpay Integration**: Complete payment processing with Razorpay
- **Payment Creation**: Generate payment links and orders
- **Payment Verification**: Secure signature verification
- **Webhook Support**: Real-time payment status updates

### Transaction Management
- **Advanced Filtering**: Filter by status, school, date range
- **Pagination**: Efficient data loading with pagination
- **Search**: Real-time search across transaction fields
- **Export**: Download transaction data as CSV
- **Aggregation**: MongoDB pipelines for complex queries

### Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin, school admin, and user roles
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API protection against abuse
- **CORS & Security**: Production-ready security headers

### User Interface
- **Responsive Design**: Mobile-first approach
- **Table Hover Effects**: Smooth animations as specified
- **Dark Mode Support**: Optional dark theme
- **Real-time Updates**: Live transaction status updates
- **Intuitive Navigation**: Clean, modern dashboard

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Payments
- `POST /api/payment/create-payment` - Create payment order
- `POST /api/payment/verify-payment` - Verify payment
- `POST /api/payment/webhook` - Payment webhook handler

### Transactions
- `GET /api/transactions` - Get all transactions (with filtering)
- `GET /api/transactions/school/:schoolId` - Get school transactions
- `GET /api/transactions/status/:customOrderId` - Check transaction status
- `GET /api/transactions/stats` - Get transaction statistics

## 📱 Frontend Pages

### Dashboard
- Statistics overview with key metrics
- Recent transactions display
- Quick action buttons
- Visual indicators and charts

### Transactions
- Comprehensive transaction table
- Advanced filtering and sorting
- Pagination with page controls
- Export functionality

### Payment Management
- Create new payment requests
- Razorpay checkout integration
- Payment status tracking
- Transaction verification

## 🎨 Table Hover Effects

As specified in the assignment, the transaction table includes:
- Smooth scaling animation on row hover
- Shadow effects for visual depth
- Color transitions for status indicators
- Interactive feedback for better UX

Reference video implementation: Smooth hover effects with scale transform and shadow animations.

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### API Testing with Postman
1. Import the provided Postman collection
2. Set environment variables (base_url, token)
3. Run authentication flow
4. Test payment creation and webhook simulation

### Demo Credentials
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

## 🚀 Deployment

### Backend Deployment (Heroku)
```bash
cd backend
git init
heroku create your-app-name
git add .
git commit -m "Initial commit"
git push heroku main
```

### Frontend Deployment (Netlify)
```bash
cd frontend
npm run build
# Upload dist/ folder to Netlify
```

### Environment Variables for Production
Update all environment variables with production values:
- Database URIs
- Payment gateway credentials
- JWT secrets
- CORS origins

## 📈 Performance Features

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data loading
- **Aggregation Pipelines**: Complex queries with MongoDB aggregation
- **Caching**: API response caching where appropriate
- **Code Splitting**: Frontend route-based code splitting

## 🔒 Security Measures

- **Authentication**: JWT with role-based access control
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Protection against API abuse
- **CORS**: Configured for specific origins
- **Helmet**: Security headers middleware
- **Password Hashing**: Bcrypt for secure password storage

## 📚 Documentation

- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Database Schema Documentation](./backend/README.md#database-schemas)
- [API Endpoint Documentation](./backend/README.md#api-endpoints)

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify MongoDB URI
   - Check IP whitelist in MongoDB Atlas

2. **Razorpay Integration Issues**
   - Confirm API keys are correct
   - Verify webhook URL configuration

3. **CORS Errors**
   - Check frontend URL in backend CORS configuration
   - Verify API base URL in frontend

### Getting Help
1. Check individual README files for detailed documentation
2. Review error logs in browser console and server logs
3. Verify environment variables are properly set
4. Ensure all dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Assignment Highlights

### Technical Implementation
- ✅ **Razorpay Integration**: Successfully replaced Cashfree with Razorpay
- ✅ **Express Backend**: Robust API with proper validation and error handling
- ✅ **React Frontend**: Modern, responsive UI with advanced interactions
- ✅ **MongoDB Integration**: Proper schema design with aggregation pipelines
- ✅ **JWT Authentication**: Secure authentication with role-based access
- ✅ **Webhook Handling**: Real-time payment status updates

### UI/UX Features
- ✅ **Table Hover Effects**: Implemented as per reference video
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Advanced Filtering**: Multi-criteria filtering with URL persistence
- ✅ **Real-time Updates**: Live transaction status tracking
- ✅ **Intuitive Dashboard**: Clean, modern interface

### Production Ready
- ✅ **Security**: Comprehensive security measures
- ✅ **Performance**: Optimized queries and caching
- ✅ **Documentation**: Detailed documentation and setup guides
- ✅ **Error Handling**: Robust error handling and user feedback
- ✅ **Deployment Ready**: Production-ready configuration

---

**Project Status**: ✅ Assignment Complete - Ready for Review

**Live Demo**: [Frontend URL] | **API**: [Backend URL] | **Repository**: [GitHub URL]
