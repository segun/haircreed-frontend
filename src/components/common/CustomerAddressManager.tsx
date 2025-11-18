import React from "react";
import type { CustomerAddress } from "../../types";
import { PlusCircle } from "lucide-react";
import Tooltip from "./Tooltip";

interface CustomerAddressManagerProps {
    addresses?: CustomerAddress[];
    selectedAddressId?: string;
    onAddressSelect: (addressId: string) => void;
    isAddingNewAddress: boolean;
    newAddress: Partial<CustomerAddress>;
    onNewAddressChange: (address: Partial<CustomerAddress>) => void;
    onAddNewAddress: () => void;
    onCancelNewAddress: () => void;
    onSaveNewAddress?: () => void;
    disabled?: boolean;
    showAddButton?: boolean;
    showSaveButton?: boolean;
    showCancelButton?: boolean;
    allowEdit?: boolean;
}

/**
 * Shared component for managing customer addresses.
 * Handles address selection, adding new addresses, and setting primary addresses.
 * Used across CustomerForm, CustomerInformationForm, and OrderDetailsModal.
 *
 * Need to add a new address field? Modify this component once!
 */
const CustomerAddressManager: React.FC<CustomerAddressManagerProps> = ({
    addresses = [],
    selectedAddressId = "",
    onAddressSelect,
    isAddingNewAddress,
    newAddress,
    onNewAddressChange,
    onAddNewAddress,
    onCancelNewAddress,
    onSaveNewAddress,
    disabled = false,
    showAddButton = true,
    showSaveButton = false,
    showCancelButton = true,
    allowEdit = true,
}) => {
    console.log("Rendering CustomerAddressManager with props:", {
        addresses,
        selectedAddressId,
        isAddingNewAddress,
        newAddress,
        disabled,
        showAddButton,
        showSaveButton,
        showCancelButton,
        allowEdit,
    });
    const hasAddresses = addresses && addresses.length > 0;
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    return (
        <div className="space-y-2">
            {/* Address Selection Dropdown (for existing customers with addresses) */}
            {hasAddresses && !isAddingNewAddress && (
                <div>
                    <label
                        htmlFor="address-select"
                        className="block text-sm font-medium text-zinc-700 mb-1"
                    >
                        Select Address
                    </label>
                    <div className="flex items-center gap-2">
                        <select
                            id="address-select"
                            onChange={(e) => onAddressSelect(e.target.value)}
                            value={selectedAddressId}
                            disabled={disabled}
                            className="flex-1 block w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100 disabled:cursor-not-allowed"
                        >
                            {addresses.map((addr) => (
                                <option key={addr.id} value={addr.id}>
                                    {addr.address} {addr.isPrimary ? "(Primary)" : ""}
                                </option>
                            ))}
                        </select>
                        {showAddButton && !disabled && (
                            <Tooltip content="Add new address">
                                <button
                                    type="button"
                                    onClick={onAddNewAddress}
                                    className="px-3 py-2 text-white bg-zinc-600 rounded-md hover:bg-zinc-700 flex items-center gap-1"
                                >
                                    <PlusCircle size={20} />
                                </button>
                            </Tooltip>
                        )}
                    </div>
                </div>
            )}

            {/* Address Input/Display */}
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-zinc-700 mb-1">
                    {isAddingNewAddress ? "New Address" : "Address"}
                </label>
                <textarea
                    id="address"
                    rows={3}
                    value={
                        isAddingNewAddress || !hasAddresses
                            ? newAddress.address || ""
                            : selectedAddress?.address || ""
                    }
                    onChange={(e) =>
                        (isAddingNewAddress || !hasAddresses) &&
                        onNewAddressChange({ ...newAddress, address: e.target.value })
                    }
                    disabled={disabled}
                    readOnly={!isAddingNewAddress && hasAddresses && !allowEdit}
                    placeholder={
                        isAddingNewAddress || !hasAddresses
                            ? "Enter address..."
                            : ""
                    }
                    className="block w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100 disabled:cursor-not-allowed"
                />

                {/* Primary Address Checkbox */}
                {(isAddingNewAddress || selectedAddress || !hasAddresses) && (
                    <div className="flex items-center mt-2">
                        <input
                            id="isPrimary"
                            name="isPrimary"
                            type="checkbox"
                            checked={newAddress.isPrimary || false}
                            onChange={(e) => {
                                onNewAddressChange({
                                    ...newAddress,
                                    isPrimary: e.target.checked,
                                });
                            }}
                            disabled={disabled || (!isAddingNewAddress && hasAddresses && !allowEdit)}
                            className="h-4 w-4 text-zinc-600 focus:ring-zinc-500 border-zinc-300 rounded disabled:cursor-not-allowed"
                        />
                        <label htmlFor="isPrimary" className="ml-2 block text-sm text-zinc-700">
                            {isAddingNewAddress || !hasAddresses
                                ? "Set as primary address"
                                : "Primary address"}
                        </label>
                    </div>
                )}
            </div>

            {/* Action Buttons for New Address */}
            {isAddingNewAddress && (
                <div className="flex justify-end gap-2 mt-3">
                    {showSaveButton && onSaveNewAddress && (
                        <Tooltip content="Save new address">
                            <button
                                type="button"
                                onClick={onSaveNewAddress}
                                disabled={disabled || !newAddress.address?.trim()}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Done
                            </button>
                        </Tooltip>
                    )}
                    {showCancelButton && (
                        <Tooltip content="Cancel adding address">
                            <button
                                type="button"
                                onClick={onCancelNewAddress}
                                disabled={disabled}
                                className="px-3 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </Tooltip>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerAddressManager;
