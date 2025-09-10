# 🚀 Deployment & Setup Guide

## Quick Setup (Development)

### Prerequisites
- Node.js v16+ installed
- MongoDB Atlas account (free tier works)
- Razorpay account for payment processing

### 1. Environment Setup

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school_payment_db
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 2. Installation & Running

#### Option A: Manual Setup
```bash
# Backend
cd backend
npm install
npm run dev      # Starts on port 5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev      # Starts on port 5173
```

#### Option B: Root Level Setup
```bash
# Install root dependencies
npm install

# Install all dependencies
npm run setup

# Start both servers (requires concurrently)
npm run dev
```

### 3. Database Seeding
```bash
cd backend
npm run seed     # Creates sample data
```

### 4. Test Login
- URL: http://localhost:5173
- Email: admin@example.com
- Password: password123

## 🌐 Production Deployment

### Backend Deployment (Railway/Heroku)

#### Railway
```bash
cd backend
# Connect to Railway and deploy
railway login
railway link
railway up
```

#### Heroku
```bash
cd backend
heroku create your-app-name
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Frontend Deployment (Netlify/Vercel)

#### Netlify
```bash
cd frontend
npm run build
# Upload dist/ folder to Netlify
# Or connect GitHub repo for auto-deployment
```

#### Vercel
```bash
cd frontend
npm install -g vercel
vercel --prod
```

### Environment Variables for Production

#### Backend Production Env
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://prod-user:prod-pass@cluster.mongodb.net/school_payment_prod
JWT_SECRET=production_jwt_secret_min_32_chars
RAZORPAY_KEY_ID=rzp_live_your_key_id
RAZORPAY_KEY_SECRET=your_live_razorpay_secret
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend Production Env
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_your_key_id
```

## 🔧 Configuration Steps

### 1. MongoDB Atlas Setup
1. Create account at mongodb.com
2. Create new cluster (free tier)
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for development)
5. Get connection string

### 2. Razorpay Setup
1. Create account at razorpay.com
2. Get test API keys from dashboard
3. Configure webhook URL: `https://your-backend-domain.com/api/payment/webhook`
4. For production, get live API keys

### 3. JWT Secret Generation
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 Verification Checklist

### Backend Verification
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] JWT authentication working
- [ ] API endpoints responding
- [ ] Razorpay integration configured

### Frontend Verification
- [ ] Application loads successfully
- [ ] Login/register working
- [ ] Dashboard displays data
- [ ] API calls successful
- [ ] Responsive design working

### API Testing
```bash
# Health check
curl https://your-backend-domain.com/health

# Test registration
curl -X POST https://your-backend-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## 🐛 Common Issues & Solutions

### Backend Issues

#### MongoDB Connection Error
```
Error: MongoNetworkError: failed to connect to server
```
**Solution:**
- Check MongoDB URI format
- Verify IP whitelist in Atlas
- Ensure network connectivity

#### JWT Error
```
Error: secretOrPrivateKey has a minimum key size of 256 bits
```
**Solution:**
- Generate longer JWT secret (32+ characters)

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Frontend Issues

#### API Connection Error
```
Network Error: Failed to fetch
```
**Solution:**
- Verify backend is running
- Check VITE_API_BASE_URL in .env
- Ensure CORS is properly configured

#### Build Errors
```
Error: Failed to resolve entry for package
```
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Razorpay Issues

#### Invalid API Key
```
Error: The id provided does not exist
```
**Solution:**
- Verify Razorpay key format (rzp_test_... or rzp_live_...)
- Check key is active in Razorpay dashboard

## 📞 Support Resources

### Documentation
- [Backend API Docs](../backend/README.md)
- [Frontend Docs](../frontend/README.md)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

### Debugging Tools
- Browser Developer Tools (Network tab)
- Postman for API testing
- MongoDB Compass for database inspection
- Razorpay Dashboard for payment monitoring

## 🎯 Performance Tips

### Backend Optimization
- Enable MongoDB indexes
- Use connection pooling
- Implement request caching
- Add compression middleware

### Frontend Optimization
- Enable code splitting
- Optimize bundle size
- Use lazy loading
- Implement service workers

## 🔒 Security Checklist

### Production Security
- [ ] Use HTTPS everywhere
- [ ] Set secure environment variables
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Use strong JWT secrets
- [ ] Validate all inputs
- [ ] Keep dependencies updated

---

**Need Help?** 
- Check the troubleshooting section above
- Review error logs in browser console and server logs
- Verify all environment variables are set correctly
- Ensure all dependencies are properly installed
