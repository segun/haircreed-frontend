import React, { useState, useEffect } from "react";
import type { Customer, CustomerAddress } from "../../types";
import { PlusCircle } from "lucide-react";

type CustomerFormProps = {
    customer: Customer | null;
    onSave: (customer: Omit<Customer, "id" | "createdAt" | "orders" | "addresses"> & { id?: string; newAddress?: Partial<CustomerAddress> | null; addressChanged?: boolean; updatedAddresses?: Partial<CustomerAddress>[] | null }) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
};

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSave, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        headSize: "",
    });
    const [selectedAddress, setSelectedAddress] = useState<Partial<CustomerAddress> | null>(null);
    const [originalSelectedAddress, setOriginalSelectedAddress] = useState<Partial<CustomerAddress> | null>(null);
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [newAddressText, setNewAddressText] = useState("");
    const [newAddressIsPrimary, setNewAddressIsPrimary] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (customer) {
            setFormData({
                fullName: customer.fullName || "",
                email: customer.email || "",
                phoneNumber: customer.phoneNumber || "",
                headSize: customer.headSize || "",
            });
            
            // Set the selected address to primary or first available
            if (customer.addresses && customer.addresses.length > 0) {
                const primaryAddress = customer.addresses.find((a) => a.isPrimary) || customer.addresses[0];
                setSelectedAddress(primaryAddress);
                setOriginalSelectedAddress(primaryAddress);
            } else {
                setSelectedAddress(null);
                setOriginalSelectedAddress(null);
            }
            setIsAddingNewAddress(false);
            setNewAddressText("");
            setNewAddressIsPrimary(false);
        } else {
            setFormData({
                fullName: "",
                email: "",
                phoneNumber: "",
                headSize: "",
            });
            setSelectedAddress(null);
            setOriginalSelectedAddress(null);
            setIsAddingNewAddress(false);
            setNewAddressText("");
            setNewAddressIsPrimary(true); // First address should be primary
        }
        setErrors({});
    }, [customer]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddNewAddress = () => {
        setIsAddingNewAddress(true);
        setNewAddressText("");
        setNewAddressIsPrimary(customer ? false : true); // First address is primary for new customers
    };

    const handleCancelAddAddress = () => {
        setIsAddingNewAddress(false);
        setNewAddressText("");
        setNewAddressIsPrimary(false);
        
        // Revert to primary or first address
        if (customer && customer.addresses && customer.addresses.length > 0) {
            const primaryAddress = customer.addresses.find((a) => a.isPrimary) || customer.addresses[0];
            setSelectedAddress(primaryAddress);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }

        // Check if existing address was changed
        let addressChanged = false;
        let updatedAddresses = null;

        if (customer && selectedAddress && originalSelectedAddress && customer.addresses) {
            // Check if isPrimary changed or if we're dealing with a different address altogether
            const isPrimaryChanged = selectedAddress.isPrimary !== originalSelectedAddress.isPrimary;
            const addressIdChanged = selectedAddress.id !== originalSelectedAddress.id;
            
            if (isPrimaryChanged || addressIdChanged) {
                addressChanged = true;
                // Send all addresses with proper isPrimary values
                updatedAddresses = customer.addresses.map(addr => {
                    if (addr.id === selectedAddress.id) {
                        return { ...addr, isPrimary: selectedAddress.isPrimary };
                    }
                    // If selectedAddress is primary, set all others to false
                    return { 
                        ...addr, 
                        isPrimary: selectedAddress.isPrimary ? false : addr.isPrimary 
                    };
                });
            }
        }

        const customerData = {
            ...formData,
            newAddress: isAddingNewAddress && newAddressText.trim() 
                ? { address: newAddressText.trim(), isPrimary: newAddressIsPrimary } 
                : (!customer && newAddressText.trim()
                    ? { address: newAddressText.trim(), isPrimary: newAddressIsPrimary }
                    : null),
            ...(customer ? { 
                id: customer.id,
                addressChanged,
                updatedAddresses 
            } : {}),
        };

        await onSave(customerData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-zinc-800 mb-4">
                {customer ? "Edit Customer" : "Add New Customer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700 mb-1">
                        Full Name *
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={`block w-full px-3 py-2 border ${errors.fullName ? "border-red-500" : "border-zinc-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500`}
                    />
                    {errors.fullName && (
                        <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
                        Email *
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={`block w-full px-3 py-2 border ${errors.email ? "border-red-500" : "border-zinc-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-zinc-700 mb-1">
                        Phone Number *
                    </label>
                    <input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className={`block w-full px-3 py-2 border ${errors.phoneNumber ? "border-red-500" : "border-zinc-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500`}
                    />
                    {errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="headSize" className="block text-sm font-medium text-zinc-700 mb-1">
                        Head Size
                    </label>
                    <input
                        id="headSize"
                        name="headSize"
                        type="text"
                        value={formData.headSize}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="block w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                </div>

                {/* Address Management Section */}
                {customer && customer.addresses && customer.addresses.length > 0 && (
                    <div>
                        <label htmlFor="address-select" className="block text-sm font-medium text-zinc-700 mb-1">
                            Select Address
                        </label>
                        <div className="flex items-center gap-2">
                            <select
                                id="address-select"
                                onChange={(e) => {
                                    const selected = customer.addresses?.find((a) => a.id === e.target.value);
                                    setSelectedAddress(selected ? { ...selected } : null);
                                    setIsAddingNewAddress(false);
                                }}
                                value={selectedAddress?.id || ""}
                                disabled={isSubmitting || isAddingNewAddress}
                                className="flex-1 block w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            >
                                {customer.addresses.map((addr) => (
                                    <option key={addr.id} value={addr.id}>
                                        {addr.address} {addr.isPrimary ? "(Primary)" : ""}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={handleAddNewAddress}
                                disabled={isSubmitting || isAddingNewAddress}
                                className="px-3 py-2 text-white bg-zinc-600 rounded-md hover:bg-zinc-700 disabled:opacity-50 flex items-center gap-1"
                                title="Add new address"
                            >
                                <PlusCircle size={20} />
                            </button>
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-zinc-700 mb-1">
                        {isAddingNewAddress ? "New Address" : customer ? "Selected Address" : "Address"}
                    </label>
                    <textarea
                        id="address"
                        rows={3}
                        value={isAddingNewAddress ? newAddressText : (!customer ? newAddressText : (selectedAddress?.address || ""))}
                        onChange={(e) => {
                            if (isAddingNewAddress || !customer) {
                                setNewAddressText(e.target.value);
                            }
                        }}
                        disabled={isSubmitting || (!isAddingNewAddress && customer !== null)}
                        readOnly={!isAddingNewAddress && customer !== null}
                        className="block w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500"
                        placeholder={isAddingNewAddress ? "Enter new address" : customer ? "Select an address from the dropdown" : "Enter customer address"}
                    />
                    
                    {(isAddingNewAddress || !customer || (customer && selectedAddress)) && (
                        <div className="flex items-center mt-2">
                            <input
                                id="isPrimary"
                                name="isPrimary"
                                type="checkbox"
                                checked={isAddingNewAddress || !customer ? newAddressIsPrimary : (selectedAddress?.isPrimary || false)}
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    if (isAddingNewAddress || !customer) {
                                        setNewAddressIsPrimary(isChecked);
                                    } else if (selectedAddress && customer) {
                                        // When setting an address as primary, unmark all others
                                        if (isChecked) {
                                            // Update all addresses to have isPrimary = false except the selected one
                                            const updatedAddresses = customer.addresses.map(addr => ({
                                                ...addr,
                                                isPrimary: addr.id === selectedAddress.id
                                            }));
                                            // Store the updated addresses back to customer for reference
                                            customer.addresses = updatedAddresses;
                                        }
                                        setSelectedAddress({ ...selectedAddress, isPrimary: isChecked });
                                    }
                                }}
                                disabled={isSubmitting || (!isAddingNewAddress && !customer)}
                                className="h-4 w-4 text-zinc-600 focus:ring-zinc-500 border-zinc-300 rounded"
                            />
                            <label htmlFor="isPrimary" className="ml-2 block text-sm text-zinc-700">
                                {isAddingNewAddress || !customer ? "Set as primary address" : "Primary address"}
                            </label>
                        </div>
                    )}

                    {isAddingNewAddress && (
                        <div className="flex justify-end gap-2 mt-3">
                            <button
                                type="button"
                                onClick={handleCancelAddAddress}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 justify-end pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-zinc-600 rounded-md hover:bg-zinc-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving..." : customer ? "Update Customer" : "Create Customer"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerForm;
