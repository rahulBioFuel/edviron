import React from 'react';

const PaymentCheckout = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white shadow rounded-lg p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Checkout</h2>
                <p className="text-gray-600">
                    Razorpay payment checkout page.
                </p>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">
                        🚧 Implementation in progress: Razorpay checkout integration.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentCheckout;
