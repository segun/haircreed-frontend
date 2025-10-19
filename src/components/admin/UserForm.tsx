import React, { useState, useEffect } from "react";
import type { User } from "../../types";

type UserFormProps = {
    user: User | null;
    onSave: (user: Omit<User, "id"> | User) => void;
    onCancel: () => void;
    isSubmitting: boolean;
};

const generatePassword = () => {
    const length = 8;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "@#$";
    const all = uppercase + numbers + special;

    let password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = 4; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password
        .split("")
        .sort(() => 0.5 - Math.random())
        .join("");
};

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState<Omit<User, "id"> & { password?: string }>({
        username: "",
        fullName: "",
        email: "",
        role: "POS_OPERATOR",
        requiresPasswordReset: true,
        passwordHash: "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    });

    useEffect(() => {
        if (user) {
            setFormData(user);
        } else {
            setFormData({
                username: "",
                fullName: "",
                email: "",
                role: "POS_OPERATOR",
                requiresPasswordReset: true,
                passwordHash: generatePassword(),
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleRegeneratePassword = () => {
        setFormData((prev) => ({ ...prev, passwordHash: generatePassword() }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-zinc-700">
                    Username
                </label>
                <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700">
                    Full Name
                </label>
                <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                />
            </div>
            {!user && (
                <div>
                    <label
                        htmlFor="passwordHash"
                        className="block text-sm font-medium text-zinc-700"
                    >
                        Default Password
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                            type="text"
                            name="passwordHash"
                            id="passwordHash"
                            value={formData.passwordHash}
                            onChange={handleChange}
                            className="flex-1 block w-full min-w-0 rounded-none rounded-l-md border border-zinc-300 px-3 py-2 focus:border-zinc-500 focus:ring-zinc-500 sm:text-sm"
                        />
                        <button
                            type="button"
                            onClick={handleRegeneratePassword}
                            className="inline-flex items-center rounded-r-md border border-l-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500 hover:bg-zinc-100"
                        >
                            Regenerate
                        </button>
                    </div>
                </div>
            )}
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-zinc-700">
                    Role
                </label>
                <select
                    name="role"
                    id="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                >
                    <option value="ORDER_OPERATOR">Order Operator</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                </select>
            </div>
            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900 disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Saving..." : "Save"}
                </button>
            </div>
        </form>
    );
};

export default UserForm;
