import React, { useState } from "react";
import type { User } from "../types";
import { createUser, deleteUser, updateUser } from "../api/users";
import AdminLayout from "../components/layouts/AdminLayout";
import UserForm from "../components/admin/UserForm";
import UserTable from "../components/admin/UserTable";
import db from "../instant";
import LoadingIndicator from "../components/common/LoadingIndicator";

type UserManagementPageProps = {
    user: User;
    onLogout: () => void;
};

const UserManagementPage: React.FC<UserManagementPageProps> = ({ user, onLogout }: UserManagementPageProps) => {
    const { data } = db.useQuery({ Users: {} });
    const users = data?.Users || [];
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSaveUser = async (user: Omit<User, "id"> | User) => {
        setIsSubmitting(true);
        try {
            if ("id" in user) {
                await updateUser(user.id, user);
            } else {
                await createUser(user);
            }
            setIsFormOpen(false);
            setEditingUser(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsFormOpen(true);
    };

    const handleDeleteUser = async (userId: string) => {
        setIsSubmitting(true);
        try {
            await deleteUser(userId);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingUser(null);
    };

    return (
        <AdminLayout pageTitle="User Management" user={user || undefined} onLogout={onLogout}>
            <div className="p-4">
                {isSubmitting && <LoadingIndicator />}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setIsFormOpen(true);
                        }}
                        className="px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-900"
                    >
                        Add User
                    </button>
                </div>
                {isFormOpen && (
                    <div className="mb-4">
                        <UserForm
                            user={editingUser}
                            onSave={handleSaveUser}
                            onCancel={handleCancel}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                )}
                <UserTable users={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
            </div>
        </AdminLayout>
    );
};

export default UserManagementPage;
