import React, { useState } from "react";
import { Eye, EyeOff, User as UserIcon, Lock, Save, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import type { User } from "../types";
import { updateUserSettings } from "../api/users";
import AdminLayout from "../components/layouts/AdminLayout";
import LoadingIndicator from "../components/common/LoadingIndicator";

type UserSettingsPageProps = {
    user: User;
    onLogout: () => void;
    onUserUpdate?: (updatedUser: User) => void;
};

const UserSettingsPage: React.FC<UserSettingsPageProps> = ({ 
    user, 
    onLogout, 
    onUserUpdate 
}: UserSettingsPageProps) => {
    const [formData, setFormData] = useState({
        fullName: user.fullName,
        newPassword: "",
        confirmPassword: "",
        currentPassword: "",
    });
    
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (formData.newPassword && formData.newPassword.length < 6) {
            newErrors.newPassword = "New password must be at least 6 characters";
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!formData.currentPassword) {
            newErrors.currentPassword = "Current password is required to save changes";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Check if any changes were made
        const hasChanges = 
            formData.fullName !== user.fullName ||
            formData.newPassword.trim() !== "";

        if (!hasChanges) {
            toast.error("No changes to save");
            return;
        }

        setIsSubmitting(true);
        try {
            const updates: { fullName?: string; username?: string; newPassword?: string } = {};
            
            if (formData.fullName !== user.fullName) {
                updates.fullName = formData.fullName;
            }
                        
            if (formData.newPassword.trim()) {
                updates.newPassword = formData.newPassword;
            }

            const updatedUser = await updateUserSettings(
                user.id,
                updates,
                formData.currentPassword
            );

            // Update local storage and parent component
            localStorage.setItem('user', JSON.stringify(updatedUser));
            onUserUpdate?.(updatedUser);

            // Clear form
            setFormData(prev => ({
                ...prev,
                newPassword: "",
                confirmPassword: "",
                currentPassword: "",
            }));

            toast.success("Settings updated successfully");
        } catch (error) {
            console.error("Failed to update user settings:", error);
            toast.error(error instanceof Error ? error.message : "Failed to update settings");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            fullName: user.fullName,
            newPassword: "",
            confirmPassword: "",
            currentPassword: "",
        });
        setErrors({});
    };

    const hasChanges = 
        formData.fullName !== user.fullName ||
        formData.newPassword.trim() !== "";

    return (
        <AdminLayout pageTitle="User Settings" user={user} onLogout={onLogout}>
            <div className="max-w-2xl mx-auto">
                {isSubmitting && <LoadingIndicator />}
                
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <div className="flex items-center mb-6">
                        <UserIcon className="w-6 h-6 text-zinc-600 mr-2" />
                        <h1 className="text-2xl font-bold text-zinc-900">User Settings</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Profile Information Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Profile Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 ${
                                            errors.fullName ? 'border-red-500' : 'border-zinc-300'
                                        }`}
                                    />
                                    {errors.fullName && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.fullName}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-zinc-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={user.username}
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm bg-zinc-50 text-zinc-500 cursor-not-allowed"
                                        disabled
                                    />
                                    <p className="mt-1 text-sm text-zinc-500">Username cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm bg-zinc-50 text-zinc-500 cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-sm text-zinc-500">Email cannot be changed</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={user.role}
                                        disabled
                                        className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm bg-zinc-50 text-zinc-500 cursor-not-allowed capitalize"
                                    />
                                    <p className="mt-1 text-sm text-zinc-500">Role cannot be changed</p>
                                </div>
                            </div>
                        </div>

                        {/* Change Password Section */}
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center">
                                <Lock className="w-5 h-5 mr-2" />
                                Change Password
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-700 mb-1">
                                        New Password (optional)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPasswords.new ? "text" : "password"}
                                            name="newPassword"
                                            id="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 ${
                                                errors.newPassword ? 'border-red-500' : 'border-zinc-300'
                                            }`}
                                            placeholder="Leave blank to keep current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('new')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPasswords.new ? (
                                                <EyeOff className="w-4 h-4 text-zinc-400" />
                                            ) : (
                                                <Eye className="w-4 h-4 text-zinc-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.newPassword && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" />
                                            {errors.newPassword}
                                        </p>
                                    )}
                                </div>

                                {formData.newPassword && (
                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 mb-1">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 ${
                                                    errors.confirmPassword ? 'border-red-500' : 'border-zinc-300'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            >
                                                {showPasswords.confirm ? (
                                                    <EyeOff className="w-4 h-4 text-zinc-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-zinc-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Current Password Confirmation */}
                        <div className="border-t pt-6">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Confirm Changes</h2>
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-zinc-700 mb-1">
                                    Current Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        name="currentPassword"
                                        id="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 ${
                                            errors.currentPassword ? 'border-red-500' : 'border-zinc-300'
                                        }`}
                                        placeholder="Enter your current password to confirm changes"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePasswordVisibility('current')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPasswords.current ? (
                                            <EyeOff className="w-4 h-4 text-zinc-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 text-zinc-400" />
                                        )}
                                    </button>
                                </div>
                                {errors.currentPassword && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.currentPassword}
                                    </p>
                                )}
                                <p className="mt-1 text-sm text-zinc-500">
                                    Required for all changes to ensure account security
                                </p>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !hasChanges}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default UserSettingsPage;