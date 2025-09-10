import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CreatePayment = () => {
    const [formData, setFormData] = useState({
        school_id: '',
        trustee_id: '',
        student_info: {
            id: '',
            name: '',
            email: '',
            phone: '',
            class: '',
            section: ''
        },
        order_amount: '',
        currency: 'INR',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('student_')) {
            const field = name.replace('student_', '');
            setFormData(prev => ({
                ...prev,
                student_info: {
                    ...prev.student_info,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.school_id || !formData.order_amount || !formData.student_info.name) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (parseFloat(formData.order_amount) <= 0) {
            toast.error('Amount must be greater than 0');
            return;
        }

        try {
            setLoading(true);

            const paymentData = {
                ...formData,
                order_amount: parseFloat(formData.order_amount),
                trustee_id: formData.trustee_id || user?.id || 'default_trustee'
            };

            console.log('Creating payment with data:', paymentData);

            const response = await paymentAPI.createPayment(paymentData);

            console.log('Payment creation response:', response);

            if (response.data.success) {
                toast.success('Payment order created successfully!');

                // Redirect to checkout page with payment data
                const checkoutUrl = response.data.data.checkout_url;
                if (checkoutUrl) {
                    window.location.href = checkoutUrl;
                } else {
                    // Fallback: navigate to payment checkout with order ID
                    navigate(`/payment-checkout?order_id=${response.data.data.order_id}`);
                }
            } else {
                toast.error(response.data.message || 'Failed to create payment');
            }
        } catch (error) {
            console.error('Error creating payment:', error);

            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to create payment. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            school_id: '',
            trustee_id: '',
            student_info: {
                id: '',
                name: '',
                email: '',
                phone: '',
                class: '',
                section: ''
            },
            order_amount: '',
            currency: 'INR',
            description: ''
        });
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Create Payment
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Create a new payment request using Razorpay integration
                    </p>
                </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white shadow rounded-lg">
                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    {/* School Information */}
                    <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">School Information</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    School ID *
                                </label>
                                <input
                                    type="text"
                                    name="school_id"
                                    value={formData.school_id}
                                    onChange={handleInputChange}
                                    placeholder="Enter school ID"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Trustee ID
                                </label>
                                <input
                                    type="text"
                                    name="trustee_id"
                                    value={formData.trustee_id}
                                    onChange={handleInputChange}
                                    placeholder="Enter trustee ID (optional)"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Student Information */}
                    <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Student Name *
                                </label>
                                <input
                                    type="text"
                                    name="student_name"
                                    value={formData.student_info.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter student full name"
                                    className="input-field"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Student ID
                                </label>
                                <input
                                    type="text"
                                    name="student_id"
                                    value={formData.student_info.id}
                                    onChange={handleInputChange}
                                    placeholder="Enter student ID"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="student_email"
                                    value={formData.student_info.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter email address"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="student_phone"
                                    value={formData.student_info.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter phone number"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Class
                                </label>
                                <input
                                    type="text"
                                    name="student_class"
                                    value={formData.student_info.class}
                                    onChange={handleInputChange}
                                    placeholder="Enter class"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Section
                                </label>
                                <input
                                    type="text"
                                    name="student_section"
                                    value={formData.student_info.section}
                                    onChange={handleInputChange}
                                    placeholder="Enter section"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Amount *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        name="order_amount"
                                        value={formData.order_amount}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="1"
                                        step="0.01"
                                        className="input-field pl-8"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Currency
                                </label>
                                <select
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                    className="input-field"
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter payment description (optional)"
                                    rows={3}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating Payment...
                                </>
                            ) : (
                                <>💳 Create Payment</>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            🔄 Reset Form
                        </button>
                    </div>
                </form>
            </div>

            {/* Help Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-3">Payment Information</h3>
                <div className="text-sm text-blue-800 space-y-2">
                    <p>🔐 <strong>Secure:</strong> All payments are processed securely through Razorpay</p>
                    <p>💳 <strong>Multiple Options:</strong> Supports cards, UPI, net banking, and wallets</p>
                    <p>📧 <strong>Notifications:</strong> Payment confirmations are sent via email</p>
                    <p>🔍 <strong>Tracking:</strong> Use the order ID to track payment status</p>
                </div>
            </div>
        </div>
    );
};

export default CreatePayment;
