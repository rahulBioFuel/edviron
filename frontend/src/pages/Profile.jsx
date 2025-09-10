import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateProfile: updateAuthProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Profile form state
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        organization: '',
        role: ''
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                organization: user.organization || '',
                role: user.role || ''
            });
        }
    }, [user]);

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            // Validate required fields
            if (!profileData.name || !profileData.email) {
                toast.error('Name and email are required');
                return;
            }

            const response = await authAPI.updateProfile(profileData);

            if (response.data.success) {
                // Update auth context
                updateAuthProfile(response.data.user);
                toast.success('Profile updated successfully!');
            } else {
                toast.error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);

            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to update profile. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.error('All password fields are required');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return;
        }

        if (passwordData.currentPassword === passwordData.newPassword) {
            toast.error('New password must be different from current password');
            return;
        }

        try {
            setLoading(true);

            const changePasswordPayload = {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            };

            const response = await authAPI.changePassword(changePasswordPayload);

            if (response.data.success) {
                // Reset form
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                toast.success('Password changed successfully!');
            } else {
                toast.error(response.data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);

            if (error.response?.status === 401) {
                toast.error('Current password is incorrect');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to change password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'Profile Information', icon: '👤' },
        { id: 'password', name: 'Change Password', icon: '🔐' },
        { id: 'preferences', name: 'Preferences', icon: '⚙️' }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Profile Settings
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your account settings and preferences
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Profile Information Tab */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleProfileInputChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleProfileInputChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileInputChange}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Organization
                                        </label>
                                        <input
                                            type="text"
                                            name="organization"
                                            value={profileData.organization}
                                            onChange={handleProfileInputChange}
                                            className="input-field"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={profileData.role}
                                            onChange={handleProfileInputChange}
                                            className="input-field"
                                        >
                                            <option value="">Select Role</option>
                                            <option value="admin">Administrator</option>
                                            <option value="manager">Manager</option>
                                            <option value="operator">Operator</option>
                                            <option value="viewer">Viewer</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Updating...
                                        </>
                                    ) : (
                                        <>💾 Save Changes</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (user) {
                                            setProfileData({
                                                name: user.name || '',
                                                email: user.email || '',
                                                phone: user.phone || '',
                                                organization: user.organization || '',
                                                role: user.role || ''
                                            });
                                        }
                                    }}
                                    className="btn-secondary"
                                    disabled={loading}
                                >
                                    🔄 Reset
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Change Password Tab */}
                    {activeTab === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                                <div className="max-w-md space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Current Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordInputChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            New Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordInputChange}
                                            className="input-field"
                                            minLength={6}
                                            required
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Must be at least 6 characters long
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm New Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordInputChange}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Changing...
                                        </>
                                    ) : (
                                        <>🔐 Change Password</>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setPasswordData({
                                        currentPassword: '',
                                        newPassword: '',
                                        confirmPassword: ''
                                    })}
                                    className="btn-secondary"
                                    disabled={loading}
                                >
                                    🔄 Clear Form
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Preferences</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                                            <p className="text-sm text-gray-500">Receive email notifications for payment updates</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                                            <p className="text-sm text-gray-500">Receive SMS notifications for payment confirmations</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Auto-refresh Dashboard</h4>
                                            <p className="text-sm text-gray-500">Automatically refresh dashboard data every 30 seconds</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <button className="btn-primary">
                                    💾 Save Preferences
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Information */}
            <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-sm font-medium text-gray-500">User ID</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user?.id || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Account Created</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                            {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'N/A'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                        <dd className="mt-1">
                            <span className="status-badge bg-green-100 text-green-800">
                                Active
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};

export default Profile;
