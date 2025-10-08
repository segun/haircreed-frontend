import React, { useState } from "react";
import type { User } from "../../types";
import ConfirmDialog from "../common/ConfirmDialog";

type UserTableProps = {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (userId: string) => void;
};

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete }) => {
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const handleDeleteClick = (userId: string) => {
        setUserToDelete(userId);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (userToDelete) {
            onDelete(userToDelete);
            setConfirmOpen(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                        >
                            Username
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                        >
                            Full Name
                        </th>
                        <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                        >
                            Role
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Edit</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-200">
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                {user.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                {user.fullName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                {user.role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => onEdit(user)}
                                    className="text-zinc-600 hover:text-zinc-900"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(user.id)}
                                    className="ml-4 text-red-600 hover:text-red-900"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ConfirmDialog
                isOpen={isConfirmOpen}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onClose={() => setConfirmOpen(false)}
            />
        </div>
    );
};

export default UserTable;
