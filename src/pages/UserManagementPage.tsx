import React, { useState } from "react";
import type { User } from "../types";
import { createUser, deleteUser, updateUser } from "../api/users";
import AdminLayout from "../components/layouts/AdminLayout";
import UserForm from "../components/admin/UserForm";
import UserTable from "../components/admin/UserTable";
import type { Page } from "../App";
import db from "../instant";

type UserManagementPageProps = {
    user: User;
    setCurrentPage: (page: Page) => void;
};

const UserManagementPage: React.FC<UserManagementPageProps> = ({ user, setCurrentPage }: UserManagementPageProps) => {
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
        await deleteUser(userId);
    };

    const handleCancel = () => {
        setIsFormOpen(false);
        setEditingUser(null);
    };

    return (
        <AdminLayout currentPage="users" pageTitle="User Management" user={user || undefined} setCurrentPage={setCurrentPage}>
            <div className="p-4">
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
