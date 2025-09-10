import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transactionAPI } from '../services/apiService';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const TransactionStatus = () => {
    const [orderId, setOrderId] = useState('');
    const [transactionData, setTransactionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();

    const checkTransactionStatus = useCallback(async (customOrderId = orderId) => {
        if (!customOrderId.trim()) {
            toast.error('Please enter a valid order ID');
            return;
        }

        try {
            setLoading(true);
            const response = await transactionAPI.checkTransactionStatus(customOrderId.trim());
            setTransactionData(response.data.data);
            toast.success('Transaction status retrieved');
        } catch (error) {
            console.error('Error checking transaction status:', error);
            setTransactionData(null);

            if (error.response?.status === 404) {
                toast.error('Transaction not found. Please check the order ID.');
            } else if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else {
                toast.error('Failed to check transaction status');
            }
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        // Check if order_id is provided in URL parameters
        const urlOrderId = searchParams.get('order_id');
        if (urlOrderId) {
            setOrderId(urlOrderId);
            checkTransactionStatus(urlOrderId);
        }
    }, [searchParams, checkTransactionStatus]);

    const handleSubmit = (e) => {
        e.preventDefault();
        checkTransactionStatus();
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return '✅';
            case 'failed':
                return '❌';
            case 'pending':
                return '⏳';
            case 'cancelled':
                return '🚫';
            default:
                return '❓';
        }
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'success':
                return 'Payment completed successfully';
            case 'failed':
                return 'Payment failed or was declined';
            case 'pending':
                return 'Payment is being processed';
            case 'cancelled':
                return 'Payment was cancelled';
            default:
                return 'Status unknown';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900">Transaction Status</h2>
                <p className="mt-2 text-gray-600">
                    Check the current status of your payment transaction
                </p>
            </div>

            {/* Search Form */}
            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                            Custom Order ID
                        </label>
                        <div className="flex space-x-3">
                            <input
                                type="text"
                                id="orderId"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Enter your order ID (e.g., ORD_1234567890_abc123)"
                                className="flex-1 input-field"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Checking...
                                    </>
                                ) : (
                                    <>🔍 Check Status</>
                                )}
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        💡 Your order ID can be found in your payment confirmation email or receipt
                    </p>
                </form>
            </div>

            {/* Transaction Details */}
            {transactionData && (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Status Header */}
                    <div className={`px-6 py-4 border-l-4 ${transactionData.status === 'success'
                            ? 'border-green-500 bg-green-50'
                            : transactionData.status === 'failed'
                                ? 'border-red-500 bg-red-50'
                                : transactionData.status === 'pending'
                                    ? 'border-yellow-500 bg-yellow-50'
                                    : 'border-gray-500 bg-gray-50'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">
                                    {getStatusIcon(transactionData.status)}
                                </span>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Transaction {transactionData.status?.toUpperCase() || 'UNKNOWN'}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {getStatusMessage(transactionData.status)}
                                    </p>
                                </div>
                            </div>
                            <span className={`status-badge ${getStatusColor(transactionData.status)}`}>
                                {transactionData.status || 'pending'}
                            </span>
                        </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="px-6 py-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-mono">
                                    {transactionData.custom_order_id}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                                <dd className="mt-1 text-lg font-semibold text-gray-900">
                                    {formatCurrency(transactionData.transaction_amount || transactionData.order_amount)}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {transactionData.payment_mode || 'N/A'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Gateway</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {transactionData.gateway || 'N/A'}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">School ID</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {transactionData.school_id}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Bank Reference</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {transactionData.bank_reference || 'N/A'}
                                </dd>
                            </div>

                            {transactionData.payment_time && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Payment Time</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {formatDate(transactionData.payment_time)}
                                    </dd>
                                </div>
                            )}

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {formatDate(transactionData.created_at)}
                                </dd>
                            </div>
                        </dl>

                        {/* Student Information */}
                        {transactionData.student_info && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Student Information</h4>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {transactionData.student_info.name || 'N/A'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {transactionData.student_info.id || 'N/A'}
                                        </dd>
                                    </div>
                                    {transactionData.student_info.email && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {transactionData.student_info.email}
                                            </dd>
                                        </div>
                                    )}
                                    {transactionData.student_info.phone && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {transactionData.student_info.phone}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}

                        {/* Payment Message */}
                        {transactionData.payment_message && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Message</h4>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {transactionData.payment_message}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-3">
                            <button
                                onClick={() => checkTransactionStatus()}
                                disabled={loading}
                                className="btn-secondary"
                            >
                                🔄 Refresh Status
                            </button>

                            {transactionData.status === 'success' && (
                                <button className="btn-primary">
                                    📄 Download Receipt
                                </button>
                            )}

                            {transactionData.status === 'failed' && (
                                <button className="btn-primary">
                                    🔄 Retry Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-3">Need Help?</h3>
                <div className="text-sm text-blue-800 space-y-2">
                    <p>🔍 <strong>Can't find your transaction?</strong> Make sure you're using the correct order ID</p>
                    <p>⏳ <strong>Payment showing as pending?</strong> Some payments may take a few minutes to process</p>
                    <p>❌ <strong>Payment failed?</strong> Check your bank account or contact your bank for more details</p>
                    <p>📧 <strong>Need support?</strong> Contact your school's payment department with your order ID</p>
                </div>
            </div>
        </div>
    );
};

export default TransactionStatus;
