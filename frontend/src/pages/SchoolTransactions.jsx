import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { schoolAPI, transactionAPI, PAYMENT_STATUS } from '../services/apiService';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SchoolTransactions = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [schoolId, setSchoolId] = useState(searchParams.get('school_id') || '');
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        limit: 10,
        has_next: false,
        has_prev: false
    });
    const [filters, setFilters] = useState({
        status: '',
        date_from: '',
        date_to: '',
        sort: 'payment_time',
        order: 'desc'
    });
    const { isAuthenticated } = useAuth();

    const fetchSchoolData = useCallback(async (page = 1) => {
        if (!schoolId.trim()) {
            setTransactions([]);
            setStats(null);
            return;
        }

        try {
            setLoading(true);

            const params = {
                page,
                limit: pagination.limit,
                ...filters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            // Fetch both transactions and stats
            const [transactionsResponse, statsResponse] = await Promise.all([
                transactionAPI.getTransactionsBySchool(schoolId, params),
                schoolAPI.getSchoolStats(schoolId, filters)
            ]);

            setTransactions(transactionsResponse.data.data.transactions || []);
            setPagination(transactionsResponse.data.data.pagination);
            setStats(statsResponse.data.data);

            // Update URL with school_id
            if (schoolId) {
                setSearchParams({ school_id: schoolId });
            }
        } catch (error) {
            console.error('Error fetching school data:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else if (error.response?.status === 404) {
                toast.error('School not found or no transactions available.');
                setTransactions([]);
                setStats(null);
            } else {
                toast.error('Failed to load school transactions');
            }
        } finally {
            setLoading(false);
        }
    }, [schoolId, filters, pagination.limit, setSearchParams]);

    useEffect(() => {
        if (isAuthenticated && schoolId) {
            fetchSchoolData();
        }
    }, [isAuthenticated, schoolId, fetchSchoolData]);

    const handleSchoolSearch = (e) => {
        e.preventDefault();
        if (schoolId.trim()) {
            fetchSchoolData(1);
        } else {
            toast.error('Please enter a school ID');
        }
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const handlePageChange = (newPage) => {
        fetchSchoolData(newPage);
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            date_from: '',
            date_to: '',
            sort: 'payment_time',
            order: 'desc'
        });
    };

    const exportSchoolTransactions = async () => {
        if (!schoolId) {
            toast.error('Please select a school first');
            return;
        }

        try {
            toast.loading('Preparing export...');
            await transactionAPI.getTransactionsBySchool(schoolId, {
                ...filters,
                limit: 1000
            });
            toast.success('Export completed');
        } catch {
            toast.error('Export failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        School Transactions
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        View and manage transactions for a specific school
                    </p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                    <button
                        onClick={exportSchoolTransactions}
                        disabled={!schoolId || loading}
                        className="btn-secondary disabled:opacity-50"
                    >
                        📊 Export
                    </button>
                    <Link
                        to="/create-payment"
                        className="btn-primary"
                    >
                        ➕ New Payment
                    </Link>
                </div>
            </div>

            {/* School Search */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select School</h3>
                <form onSubmit={handleSchoolSearch} className="flex space-x-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={schoolId}
                            onChange={(e) => setSchoolId(e.target.value)}
                            placeholder="Enter School ID"
                            className="input-field"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Loading...
                            </>
                        ) : (
                            <>🔍 Search</>
                        )}
                    </button>
                </form>
            </div>

            {/* School Statistics */}
            {stats && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Transactions"
                        value={stats.total_transactions || 0}
                        icon="📊"
                        color="primary"
                    />
                    <StatsCard
                        title="Successful Payments"
                        value={stats.successful_transactions || 0}
                        icon="✅"
                        color="success"
                        subtitle={`${stats.success_rate || 0}% success rate`}
                    />
                    <StatsCard
                        title="Total Amount"
                        value={formatCurrency(stats.total_amount || 0)}
                        icon="💰"
                        color="primary"
                    />
                    <StatsCard
                        title="Successful Amount"
                        value={formatCurrency(stats.successful_amount || 0)}
                        icon="💎"
                        color="success"
                    />
                </div>
            )}

            {/* Filters */}
            {schoolId && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Statuses</option>
                                <option value={PAYMENT_STATUS.PENDING}>Pending</option>
                                <option value={PAYMENT_STATUS.SUCCESS}>Success</option>
                                <option value={PAYMENT_STATUS.FAILED}>Failed</option>
                                <option value={PAYMENT_STATUS.CANCELLED}>Cancelled</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="input-field"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                className="input-field"
                            />
                        </div>

                        {/* Filter Actions */}
                        <div className="flex items-end space-x-2">
                            <button
                                onClick={() => fetchSchoolData(1)}
                                className="btn-primary flex-1"
                                disabled={loading}
                            >
                                🔍 Apply
                            </button>
                            <button
                                onClick={clearFilters}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            {schoolId && (
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {schoolId && `School: ${schoolId} | `}
                            Showing {transactions.length} of {pagination.total_records} transactions
                        </div>
                        <div className="text-sm text-gray-600">
                            Page {pagination.current_page} of {pagination.total_pages}
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions Table */}
            {schoolId && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            School Transaction Records
                        </h3>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading transactions...</p>
                            </div>
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.collect_id} className="table-row-hover">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.custom_order_id}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Gateway: {transaction.gateway}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.student_info?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {transaction.student_info?.email || 'N/A'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {transaction.student_info?.id || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatCurrency(transaction.transaction_amount || transaction.order_amount)}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {transaction.payment_mode || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`status-badge ${getStatusColor(transaction.status)}`}>
                                                    {transaction.status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(transaction.payment_time || transaction.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        to={`/transaction-status?order_id=${transaction.custom_order_id}`}
                                                        className="text-primary-600 hover:text-primary-900"
                                                    >
                                                        View
                                                    </Link>
                                                    {transaction.status === 'success' && (
                                                        <button className="text-green-600 hover:text-green-900">
                                                            Receipt
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : schoolId ? (
                        <div className="px-4 py-12 text-center">
                            <div className="text-gray-500">
                                <span className="text-4xl mb-4 block">📭</span>
                                <p className="text-lg">No transactions found for this school</p>
                                <p className="text-sm mt-2">Try adjusting your filters or check the school ID</p>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={!pagination.has_prev}
                            className="btn-secondary disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={!pagination.has_next}
                            className="btn-secondary disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page {pagination.current_page} of {pagination.total_pages}
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={!pagination.has_prev}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNum === pagination.current_page
                                                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={!pagination.has_next}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Help Section */}
            {!schoolId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">School Transaction Management</h3>
                    <div className="text-sm text-blue-800 space-y-2">
                        <p>🏫 <strong>School-Specific View:</strong> Enter a school ID to view all transactions for that school</p>
                        <p>� <strong>Analytics:</strong> View transaction statistics and success rates</p>
                        <p>🔍 <strong>Filtering:</strong> Filter transactions by status, date range, and more</p>
                        <p>📁 <strong>Export:</strong> Download transaction data for reporting</p>
                    </div>
                </div>
            )}
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

export default SchoolTransactions;
