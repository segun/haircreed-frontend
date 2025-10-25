import { useState } from "react";
import { Edit2, Trash2, PlusCircle, X } from "lucide-react";
import {
  createItem,
  updateItem,
  deleteItem as apiDeleteItem,
} from "../../api/inventoryAttributes";
import ConfirmDialog from "../common/ConfirmDialog";
import type { AttributeCategory, AttributeItem } from "../../types";
import Tooltip from "../common/Tooltip";
import LoadingIndicator from "../common/LoadingIndicator";

type AttributeManagerProps = {
  category: AttributeCategory;
  onUpdate: () => void; // Simplified to just trigger a refetch
  onDeleteCategory: (categoryId: string) => void;
};

export default function AttributeManager({
  category,
  onUpdate,
  onDeleteCategory,
}: AttributeManagerProps) {
  const [newItemName, setNewItemName] = useState("");
  const [editingItem, setEditingItem] = useState<AttributeItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<AttributeItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    setIsLoading(true);
    try {
      setError(null);
      await createItem(category.id, newItemName);
      setNewItemName("");
      onUpdate(); // Refetch categories
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = (item: AttributeItem) => {
    setItemToDelete(item);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      setError(null);
      await apiDeleteItem(itemToDelete.id);
      onUpdate(); // Refetch categories
      setItemToDelete(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !editingItem.name.trim()) return;
    setIsLoading(true);
    try {
      setError(null);
      await updateItem(editingItem.id, editingItem.name);
      setEditingItem(null);
      onUpdate(); // Refetch categories
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    setIsLoading(true);
    try {
      setError(null);
      onDeleteCategory(category.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Item"
        message={`Are you sure you want to delete the item "${itemToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDeleteItem}
        onClose={() => setItemToDelete(null)}
      />
      <div className="bg-white p-6 rounded-lg shadow-md relative">
        {isLoading && <LoadingIndicator />}
        <button
          onClick={handleDeleteCategory}
          className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-red-600 hover:bg-red-100 rounded-full"
          title={`Delete ${category.title} category`}
        >
          <X size={18} />
        </button>
        <h3 className="text-lg font-semibold text-zinc-800 mb-4">
          {category.title}
        </h3>

        {error && (
          <p className="text-sm text-red-500 bg-red-100 p-2 rounded-md mb-4">
            {error}
          </p>
        )}

        {/* Add/Edit Form */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={editingItem ? editingItem.name : newItemName}
            onChange={(e) => {
              if (editingItem) {
                setEditingItem({ ...editingItem, name: e.target.value });
              } else {
                setNewItemName(e.target.value);
              }
            }}
            placeholder={`Enter new ${category.title.toLowerCase()}`}
            className="flex-grow block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 text-zinc-900 focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
          />
          {editingItem ? (
            <>
              <button
                onClick={handleUpdateItem}
                className="px-4 py-2 text-sm font-medium text-white bg-zinc-600 hover:bg-zinc-700 rounded-md"
              >
                Update
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md"
              >
                Cancel
              </button>
            </>
          ) : (
            <Tooltip content={`Add new ${category.title.toLowerCase()}`}>
            <button
              onClick={handleAddItem}
              className="p-2 text-white bg-zinc-800 hover:bg-zinc-900 rounded-full"
            >
              
                <PlusCircle size={20} />
              
            </button>
            </Tooltip>
          )}
        </div>

        {/* List of Items */}
        <ul className="space-y-2 h-48 overflow-y-auto">
          {category.items.length > 0 ? (
            category.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-50"
              >
                <span className="text-zinc-700">{item.name}</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-zinc-500 hover:text-zinc-700"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRequest(item)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <p className="text-sm text-zinc-500 text-center py-4">
              No items yet.
            </p>
          )}
        </ul>
      </div>
    </>
  );
}
