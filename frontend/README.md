# School Payment Dashboard - Frontend

A modern, responsive React.js dashboard for managing school payments and transactions with Razorpay integration.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Real-time Dashboard**: Statistics and transaction overview
- **Transaction Management**: View, filter, and search transactions
- **Payment Integration**: Razorpay payment gateway integration
- **Authentication**: JWT-based authentication with role management
- **Responsive Design**: Mobile-first approach with responsive components
- **Advanced Filtering**: Multi-criteria filtering and sorting
- **Status Tracking**: Real-time transaction status monitoring
- **Dark Mode**: Toggle between light and dark themes (optional)
- **Table Hover Effects**: Advanced table interactions as specified

## 🛠️ Technology Stack

- **React 18**: Latest React with hooks and modern features
- **Vite**: Fast build tool and development server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **React Hot Toast**: Beautiful toast notifications
- **Razorpay**: Payment gateway integration
- **Date-fns**: Date manipulation and formatting

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Running backend API server

## 🛠️ Installation & Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here

# App Configuration
VITE_APP_NAME=School Payment Dashboard
VITE_APP_VERSION=1.0.0
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production
```bash
npm run build
```

## 📱 Features Overview

### Dashboard
- **Statistics Cards**: Transaction counts, amounts, success rates
- **Recent Transactions**: Latest payment activities
- **Quick Actions**: Fast navigation to key features
- **Visual Charts**: Payment trends and analytics (optional)

### Transaction Management
- **All Transactions View**: Paginated list with advanced filtering
- **School-specific View**: Filter transactions by school ID
- **Status Checker**: Look up transaction status by order ID
- **Export Features**: Download transaction data as CSV

### Payment Features
- **Payment Creation**: Create new payment requests
- **Razorpay Integration**: Secure payment processing
- **Payment Verification**: Automatic payment verification
- **Status Updates**: Real-time payment status tracking

### Advanced Table Features
- **Hover Effects**: Smooth hover animations with scale and shadow
- **Responsive Design**: Mobile-friendly table with horizontal scroll
- **Sorting**: Click column headers to sort data
- **Filtering**: Multi-criteria filtering with persistent URLs
- **Pagination**: Efficient pagination with page controls
- **Search**: Real-time search across transaction data

## 🚀 Getting Started

1. Ensure backend is running on `http://localhost:5000`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Start development server: `npm run dev`
5. Access application at `http://localhost:5173`

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review component documentation
3. Create an issue in the repository

## 📄 License

This project is licensed under the MIT License.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
