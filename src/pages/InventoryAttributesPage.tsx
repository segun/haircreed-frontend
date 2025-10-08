import { useState } from "react";
import { PlusCircle } from "lucide-react";
import db from "../instant";
import AttributeManager from "../components/admin/AttributeManager";
import AdminLayout from "../components/layouts/AdminLayout";
import ConfirmDialog from "../components/common/ConfirmDialog";
import type { Page } from "../App";
import { createCategory, deleteCategory as apiDeleteCategory } from "../api/inventoryAttributes";
import type { AttributeCategory, User } from "../types";

type InventoryAttributesPageProps = {
    user: User;
    setCurrentPage: (page: Page) => void;
};

export default function InventoryAttributesPage({
    user,
    setCurrentPage,
}: InventoryAttributesPageProps) {
    const [newCategoryName, setNewCategoryName] = useState("");
    const [writeError, setWriteError] = useState<string | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<AttributeCategory | null>(null);

    const { isLoading, error, data } = db.useQuery({
        AttributeCategory: {
            items: {}
        }
    });
    const categories = data?.AttributeCategory;

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            setWriteError(null);
            await createCategory(newCategoryName);
            setNewCategoryName("");
        } catch (err) {
            setWriteError((err as Error).message);
        }
    };

    const handleDeleteRequest = (category: AttributeCategory) => {
        setCategoryToDelete(category);
    };

    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return;
        try {
            setWriteError(null);
            await apiDeleteCategory(categoryToDelete.id);
            setCategoryToDelete(null);
        } catch (err) {
            setWriteError((err as Error).message);
        }
    };

    const handleItemUpdate = () => {};

    return (
        <>
            <ConfirmDialog 
                isOpen={!!categoryToDelete}
                title="Delete Category"
                message={`Are you sure you want to delete the category "${categoryToDelete?.title}" and all its items? This action cannot be undone.`}
                onConfirm={confirmDeleteCategory}
                onClose={() => setCategoryToDelete(null)}
            />
            <AdminLayout
                user={user}
                currentPage="inventory-attributes"
                setCurrentPage={setCurrentPage}
                pageTitle="Inventory Attributes"
            >
                {/* Component to add a new category */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <h3 className="text-lg font-semibold text-zinc-800 mb-2">
                        Add New Attribute Category
                    </h3>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="e.g., Weight, Density..."
                            className="flex-grow block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 text-zinc-900 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                        />
                        <button
                            onClick={handleAddCategory}
                            className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-900 rounded-md"
                        >
                            <PlusCircle size={16} className="mr-2" />
                            Add
                        </button>
                    </div>
                </div>

                {(error || writeError) && <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md mb-4">Error: {error?.message || writeError}</p>}

                {/* Grid of existing attribute categories */}
                {isLoading ? (
                    <p className="text-center text-zinc-500">Loading attributes...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories?.map((category) => (
                            <AttributeManager
                                key={category.id}
                                category={category}
                                onUpdate={handleItemUpdate}
                                onDeleteCategory={() => handleDeleteRequest(category)}
                            />
                        ))}
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
