import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { transactionAPI, PAYMENT_STATUS } from '../services/apiService';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
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
        school_id: '',
        date_from: '',
        date_to: '',
        search: '',
        sort: 'payment_time',
        order: 'desc'
    });
    const { isAuthenticated } = useAuth();

    const fetchTransactions = useCallback(async (page = 1) => {
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

            const response = await transactionAPI.getAllTransactions(params);

            setTransactions(response.data.data.transactions || []);
            setPagination(response.data.data.pagination);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else {
                toast.error('Failed to load transactions');
            }
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.limit]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchTransactions();
        }
    }, [isAuthenticated, fetchTransactions]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchTransactions(1);
    };

    const handlePageChange = (newPage) => {
        fetchTransactions(newPage);
    };

    const handleExport = async () => {
        try {
            toast.loading('Preparing export...');
            // This would trigger a download
            await transactionAPI.getAllTransactions({ ...filters, limit: 1000 });
            toast.success('Export completed');
        } catch {
            toast.error('Export failed');
        }
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            school_id: '',
            date_from: '',
            date_to: '',
            search: '',
            sort: 'payment_time',
            order: 'desc'
        });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        All Transactions
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage and view all payment transactions with advanced filtering and search.
                    </p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                    <button
                        onClick={handleExport}
                        className="btn-secondary"
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

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Order ID, Student name..."
                            className="input-field"
                        />
                    </div>

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

                    {/* School ID */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            School ID
                        </label>
                        <input
                            type="text"
                            value={filters.school_id}
                            onChange={(e) => handleFilterChange('school_id', e.target.value)}
                            placeholder="Enter School ID"
                            className="input-field"
                        />
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort By
                        </label>
                        <select
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className="input-field"
                        >
                            <option value="payment_time">Payment Time</option>
                            <option value="order_amount">Amount</option>
                            <option value="status">Status</option>
                            <option value="custom_order_id">Order ID</option>
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order
                        </label>
                        <select
                            value={filters.order}
                            onChange={(e) => handleFilterChange('order', e.target.value)}
                            className="input-field"
                        >
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>

                    {/* Filter Actions */}
                    <div className="flex items-end space-x-2">
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                        >
                            🔍 Search
                        </button>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="btn-secondary"
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </div>

            {/* Results Summary */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Showing {transactions.length} of {pagination.total_records} transactions
                    </div>
                    <div className="text-sm text-gray-600">
                        Page {pagination.current_page} of {pagination.total_pages}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Transaction Records
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
                                                    School: {transaction.school_id}
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
                ) : (
                    <div className="px-4 py-12 text-center">
                        <div className="text-gray-500">
                            <span className="text-4xl mb-4 block">📭</span>
                            <p className="text-lg">No transactions found</p>
                            <p className="text-sm mt-2">Try adjusting your filters or create a new payment</p>
                            <Link
                                to="/create-payment"
                                className="mt-4 inline-block btn-primary"
                            >
                                Create Payment
                            </Link>
                        </div>
                    </div>
                )}
            </div>

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

                                {/* Page numbers */}
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
        </div>
    );
};

export default Transactions;
