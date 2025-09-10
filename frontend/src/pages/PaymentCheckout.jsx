import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/apiService';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const PaymentCheckout = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);

    const fetchPaymentDetails = useCallback(async (orderId) => {
        try {
            setLoading(true);
            const response = await paymentAPI.getPaymentDetails(orderId);

            if (response.data.success) {
                setPaymentData(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch payment details');
            }
        } catch (error) {
            console.error('Error fetching payment details:', error);
            toast.error('Failed to load payment details');
            navigate('/create-payment');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const orderId = searchParams.get('order_id');
        const token = searchParams.get('token');

        if (orderId) {
            fetchPaymentDetails(orderId);
        } else if (token) {
            // Handle JWT token case
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setPaymentData(payload);
                setLoading(false);
            } catch (error) {
                console.error('Error parsing token:', error);
                toast.error('Invalid payment token');
                navigate('/create-payment');
            }
        } else {
            toast.error('No payment information found');
            navigate('/create-payment');
        }
    }, [searchParams, navigate, fetchPaymentDetails]);

    const handlePayment = async () => {
        if (!paymentData) {
            toast.error('Payment data not available');
            return;
        }

        try {
            setProcessingPayment(true);

            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => initiateRazorpayPayment();
                script.onerror = () => {
                    toast.error('Failed to load payment gateway');
                    setProcessingPayment(false);
                };
                document.body.appendChild(script);
            } else {
                initiateRazorpayPayment();
            }
        } catch (error) {
            console.error('Error initiating payment:', error);
            toast.error('Failed to initiate payment');
            setProcessingPayment(false);
        }
    };

    const initiateRazorpayPayment = () => {
        const options = {
            key: paymentData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: (paymentData.amount || paymentData.order_amount) * 100, // Convert to paisa
            currency: paymentData.currency || 'INR',
            name: 'School Payment System',
            description: `Payment for ${paymentData.student_info?.name || 'Student'}`,
            order_id: paymentData.razorpay_order_id,
            prefill: {
                name: paymentData.student_info?.name || '',
                email: paymentData.student_info?.email || '',
                contact: paymentData.student_info?.phone || ''
            },
            theme: {
                color: '#3B82F6'
            },
            handler: async (response) => {
                await handlePaymentSuccess(response);
            },
            modal: {
                ondismiss: () => {
                    setProcessingPayment(false);
                    toast.info('Payment cancelled');
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handlePaymentSuccess = async (razorpayResponse) => {
        try {
            setProcessingPayment(true);

            const verificationData = {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                custom_order_id: paymentData.order_id
            };

            const response = await paymentAPI.verifyPayment(verificationData);

            if (response.data.success) {
                toast.success('Payment successful!');
                navigate(`/transaction-status?order_id=${paymentData.order_id}`);
            } else {
                throw new Error(response.data.message || 'Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            navigate(`/transaction-status?order_id=${paymentData.order_id}`);
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (!paymentData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white shadow rounded-lg p-6 max-w-md w-full text-center">
                    <span className="text-4xl mb-4 block">❌</span>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Not Found</h2>
                    <p className="text-gray-600 mb-4">
                        We couldn't find the payment information. Please try creating a new payment.
                    </p>
                    <button
                        onClick={() => navigate('/create-payment')}
                        className="btn-primary w-full"
                    >
                        Create New Payment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payment Checkout</h1>
                    <p className="mt-2 text-gray-600">Review your payment details and proceed</p>
                </div>

                {/* Payment Details Card */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="px-6 py-4 bg-primary-50 border-b border-primary-200">
                        <h2 className="text-lg font-semibold text-primary-900">Payment Summary</h2>
                    </div>

                    <div className="p-6">
                        {/* Amount */}
                        <div className="text-center mb-6">
                            <div className="text-3xl font-bold text-gray-900">
                                {formatCurrency(paymentData.amount || paymentData.order_amount)}
                            </div>
                            <div className="text-sm text-gray-500">
                                {paymentData.currency || 'INR'}
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="border-t border-gray-200 pt-6">
                            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900 font-mono">
                                        {paymentData.order_id}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="text-sm font-medium text-gray-500">School ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {paymentData.school_id}
                                    </dd>
                                </div>

                                {paymentData.created_at && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Created</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {formatDate(paymentData.created_at)}
                                        </dd>
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Student Information */}
                        {paymentData.student_info && (
                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Details</h3>
                                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {paymentData.student_info.name || 'N/A'}
                                        </dd>
                                    </div>

                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Student ID</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {paymentData.student_info.id || 'N/A'}
                                        </dd>
                                    </div>

                                    {paymentData.student_info.email && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {paymentData.student_info.email}
                                            </dd>
                                        </div>
                                    )}

                                    {paymentData.student_info.phone && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {paymentData.student_info.phone}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Button */}
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <button
                        onClick={handlePayment}
                        disabled={processingPayment}
                        className="btn-primary w-full py-3 text-lg disabled:opacity-50"
                    >
                        {processingPayment ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                                Processing Payment...
                            </>
                        ) : (
                            <>💳 Pay {formatCurrency(paymentData.amount || paymentData.order_amount)}</>
                        )}
                    </button>

                    <div className="mt-4 text-sm text-gray-500">
                        <p>🔐 Secure payment powered by Razorpay</p>
                        <p>💳 Supports all major cards, UPI, and net banking</p>
                    </div>
                </div>

                {/* Cancel Option */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                        disabled={processingPayment}
                    >
                        ← Cancel and return to dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCheckout;
