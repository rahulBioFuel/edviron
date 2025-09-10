import React from 'react';

const TransactionStatus = () => {
    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Transaction Status</h2>
                <p className="text-gray-600">
                    Enter a custom order ID to check the current status of a transaction.
                </p>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800">
                        🚧 Implementation in progress: Transaction status checker with custom order ID lookup.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TransactionStatus;
