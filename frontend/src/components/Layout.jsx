import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: '📊',
            current: location.pathname === '/dashboard'
        },
        {
            name: 'All Transactions',
            href: '/transactions',
            icon: '💳',
            current: location.pathname === '/transactions'
        },
        {
            name: 'Check Status',
            href: '/transaction-status',
            icon: '🔍',
            current: location.pathname === '/transaction-status'
        },
        {
            name: 'Create Payment',
            href: '/create-payment',
            icon: '➕',
            current: location.pathname === '/create-payment'
        },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-50 lg:hidden`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
                <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg">
                    <SidebarContent navigation={navigation} user={user} onLogout={handleLogout} />
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="w-64 bg-white shadow-lg">
                    <SidebarContent navigation={navigation} user={user} onLogout={handleLogout} />
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                <span className="text-xl">☰</span>
                            </button>
                            <h1 className="ml-3 text-xl font-semibold text-gray-900">
                                School Payment Dashboard
                            </h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                Welcome, {user?.username || 'User'}
                            </span>
                            <Link
                                to="/profile"
                                className="flex items-center p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                <span className="text-lg">👤</span>
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const SidebarContent = ({ navigation, user, onLogout }) => {
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
                <span className="text-white text-lg font-bold">School Pay</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        to={item.href}
                        className={`sidebar-link ${item.current ? 'active' : ''}`}
                    >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.name}
                    </Link>
                ))}
            </nav>

            {/* User section */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">👤</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex space-x-2">
                    <Link
                        to="/profile"
                        className="flex-1 btn-secondary text-center text-sm py-1"
                    >
                        Profile
                    </Link>
                    <button
                        onClick={onLogout}
                        className="flex-1 btn-danger text-sm py-1"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Layout;
