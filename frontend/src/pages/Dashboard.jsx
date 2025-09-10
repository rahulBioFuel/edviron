import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { transactionAPI } from '../services/apiService';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            console.log('Fetching dashboard data...');
            console.log('Token in localStorage:', localStorage.getItem('token'));
            console.log('User authenticated:', isAuthenticated);
            console.log('Auth loading:', authLoading);

            // Test the stats call separately first
            console.log('Testing stats API call...');
            try {
                const statsResponse = await transactionAPI.getTransactionStats();
                console.log('Stats call successful:', statsResponse);
                setStats(statsResponse.data.data);
            } catch (statsError) {
                console.error('Stats API call failed:', statsError);
                console.error('Stats error response:', statsError.response?.data);
                console.error('Stats error status:', statsError.response?.status);
                console.error('Request headers:', statsError.config?.headers);
                throw statsError;
            }

            // Test the transactions call
            console.log('Testing transactions API call...');
            try {
                const transactionsResponse = await transactionAPI.getAllTransactions({
                    limit: 5,
                    sort: 'payment_time',
                    order: 'desc'
                });
                console.log('Transactions call successful:', transactionsResponse);
                setRecentTransactions(transactionsResponse.data.data.transactions);
            } catch (transError) {
                console.error('Transactions API call failed:', transError);
                throw transError;
            }

            console.log('Dashboard data fetched successfully');
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);

            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else {
                toast.error('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, authLoading]);

    useEffect(() => {
        // Only fetch data if user is authenticated and not loading
        if (isAuthenticated && !authLoading) {
            // Add a small delay to ensure token is properly set
            setTimeout(() => {
                fetchDashboardData();
            }, 100);
        } else if (!authLoading && !isAuthenticated) {
            setLoading(false);
        }
    }, [isAuthenticated, authLoading, fetchDashboardData]); if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Dashboard
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Welcome to your payment dashboard. Here's an overview of your transactions.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Link
                        to="/create-payment"
                        className="btn-primary"
                    >
                        Create Payment
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Transactions"
                    value={stats?.total_transactions || 0}
                    icon="📊"
                    color="primary"
                />
                <StatsCard
                    title="Successful Payments"
                    value={stats?.successful_transactions || 0}
                    icon="✅"
                    color="success"
                    subtitle={`${stats?.success_rate || 0}% success rate`}
                />
                <StatsCard
                    title="Total Amount"
                    value={formatCurrency(stats?.total_amount || 0)}
                    icon="💰"
                    color="primary"
                />
                <StatsCard
                    title="Successful Amount"
                    value={formatCurrency(stats?.successful_amount || 0)}
                    icon="💎"
                    color="success"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            to="/transactions"
                            className="card-hover bg-gray-50 p-4 rounded-lg text-center"
                        >
                            <div className="text-2xl mb-2">📋</div>
                            <div className="text-sm font-medium text-gray-900">View All Transactions</div>
                            <div className="text-xs text-gray-500">See all payment records</div>
                        </Link>

                        <Link
                            to="/transaction-status"
                            className="card-hover bg-gray-50 p-4 rounded-lg text-center"
                        >
                            <div className="text-2xl mb-2">🔍</div>
                            <div className="text-sm font-medium text-gray-900">Check Status</div>
                            <div className="text-xs text-gray-500">Track payment status</div>
                        </Link>

                        <Link
                            to="/create-payment"
                            className="card-hover bg-gray-50 p-4 rounded-lg text-center"
                        >
                            <div className="text-2xl mb-2">➕</div>
                            <div className="text-sm font-medium text-gray-900">New Payment</div>
                            <div className="text-xs text-gray-500">Create payment link</div>
                        </Link>

                        <Link
                            to="/profile"
                            className="card-hover bg-gray-50 p-4 rounded-lg text-center"
                        >
                            <div className="text-2xl mb-2">⚙️</div>
                            <div className="text-sm font-medium text-gray-900">Settings</div>
                            <div className="text-xs text-gray-500">Manage your account</div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Recent Transactions
                        </h3>
                        <Link
                            to="/transactions"
                            className="text-sm text-primary-600 hover:text-primary-500"
                        >
                            View all →
                        </Link>
                    </div>
                </div>

                {recentTransactions.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {recentTransactions.map((transaction) => (
                            <li key={transaction.collect_id} className="px-4 py-4 table-row-hover">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className="text-2xl">💳</span>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {transaction.student_info?.name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {transaction.custom_order_id}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">
                                                {formatCurrency(transaction.transaction_amount)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(transaction.payment_time)}
                                            </div>
                                        </div>
                                        <span className={`status-badge ${getStatusColor(transaction.status)}`}>
                                            {transaction.status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="px-4 py-8 text-center">
                        <div className="text-gray-500">
                            <span className="text-4xl mb-4 block">📭</span>
                            <p>No transactions found</p>
                            <Link
                                to="/create-payment"
                                className="mt-2 inline-block text-primary-600 hover:text-primary-500"
                            >
                                Create your first payment
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, icon, color = 'primary', subtitle }) => {
    const colorClasses = {
        primary: 'border-primary-200 bg-primary-50',
        success: 'border-success-200 bg-success-50',
        danger: 'border-danger-200 bg-danger-50',
        warning: 'border-yellow-200 bg-yellow-50',
    };

    return (
        <div className={`card-hover bg-white overflow-hidden shadow rounded-lg border-l-4 ${colorClasses[color]}`}>
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <span className="text-2xl">{icon}</span>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                {title}
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                                {value}
                            </dd>
                            {subtitle && (
                                <dd className="text-sm text-gray-500">
                                    {subtitle}
                                </dd>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
