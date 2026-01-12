/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import type { Order, User, CustomerAddress, CustomerSearchType } from "../../types";
import Modal from "../common/Modal";
import { updateOrder, deleteOrder } from "../../api/orders";
import { downloadReceipt } from "../../api/pdf";
import { updateCustomer, createCustomer } from "../../api/customers";
import ConfirmDialog from "../common/ConfirmDialog";
import { Edit, Save, X, Search, PlusCircle } from "lucide-react";
import db from "../../instant";

interface OrderDetailsModalProps {
    isOpen: boolean;
    order: Order;
    user: User;
    onClose: () => void;
    onOrderStatusChange: (orderId: string, status: string) => void;
    onPaymentStatusChange: (orderId: string, status: string) => void;
}

const ORDER_STATUSES = [
    "CREATED",
    "IN PROGRESS",
    "COMPLETED",
    "DISPATCHED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
];
const PAYMENT_STATUSES = ["PENDING", "PAID"];

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
    isOpen,
    order,
    user,
    onClose,
    onOrderStatusChange,
    onPaymentStatusChange,
}) => {
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmTitle, setConfirmTitle] = useState("Confirm Action");
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Customer management state
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>(order.customer?.id || "");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState<CustomerSearchType>("email");
    const [isSearching, setIsSearching] = useState(false);
    const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);

    // Address management
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState<Partial<CustomerAddress>>({
        address: "",
        isPrimary: false,
    });

    // Editable fields
    const [editedCustomer, setEditedCustomer] = useState({
        fullName: order.customer?.fullName || "",
        email: order.customer?.email || "",
        phoneNumber: order.customer?.phoneNumber || "",
        headSize: order.customer?.headSize || "",
    });
    const [editedDeliveryMethod, setEditedDeliveryMethod] = useState(
        order.deliveryMethod || "pickup",
    );
    const [editedNotes, setEditedNotes] = useState(order.notes || "");
    const [editedWigger, setEditedWigger] = useState(order.wigger?.name || "");

    // Fetch all customers for dropdown
    const { data: customersData } = db.useQuery({
        Customers: { addresses: {} },
    });

    const allCustomers = customersData?.Customers || [];
    // Get selected customer details
    const selectedCustomer = allCustomers.find((c: any) => c.id === selectedCustomerId) || null;

    // Reset edited fields when order changes
    useEffect(() => {
        setEditedCustomer({
            fullName: order.customer?.fullName || "",
            email: order.customer?.email || "",
            phoneNumber: order.customer?.phoneNumber || "",
            headSize: order.customer?.headSize || "",
        });
        setEditedDeliveryMethod(order.deliveryMethod || "DELIVERY");
        setEditedNotes(order.notes || "");
        setEditedWigger(order.wigger?.name || "");
        setSelectedCustomerId(order.customer?.id || "");
        setIsEditMode(false);
        setIsAddingNewAddress(false);
        setIsNewCustomerMode(false);
    }, [order]);

    // Update selected address when customer changes
    useEffect(() => {
        if (selectedCustomer?.addresses && selectedCustomer.addresses.length > 0) {
            // Try to find the primary address or use the first one
            const primaryAddr =
                selectedCustomer.addresses.find((a: any) => a.isPrimary) ||
                selectedCustomer.addresses[0];
            setSelectedAddressId(primaryAddr?.id || "");
        } else {
            setSelectedAddressId("");
        }
    }, [selectedCustomer]);

    // Update edited customer fields when selected customer changes
    useEffect(() => {
        if (selectedCustomer && isEditMode) {
            setEditedCustomer({
                fullName: selectedCustomer.fullName || "",
                email: selectedCustomer.email || "",
                phoneNumber: selectedCustomer.phoneNumber || "",
                headSize: selectedCustomer.headSize || "",
            });
        }
    }, [selectedCustomer, isEditMode]);

    if (!order) return null;

    const handleOrderStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setConfirmTitle("Confirm Status Change");
        setConfirmMessage(`Are you sure you want to change the order status to ${newStatus}?`);
        setConfirmAction(() => () => confirmOrderStatusChange(newStatus));
        setConfirmOpen(true);
    };

    const confirmOrderStatusChange = async (newStatus: string) => {
        const promise = updateOrder(order.id, user.id, { orderStatus: newStatus });

        try {
            await toast.promise(promise, {
                loading: "Updating order status...",
                success: "Order status updated successfully!",
                error: (err: Error) => `Failed to update order status: ${err.message}`,
            });
            onOrderStatusChange(order.id, newStatus);
        } catch (error) {
            console.error("Failed to update order status:", error);
        } finally {
            setConfirmOpen(false);
        }
    };

    const handlePaymentStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setConfirmTitle("Confirm Payment Status Change");
        setConfirmMessage(`Are you sure you want to change the payment status to ${newStatus}?`);
        setConfirmAction(() => () => confirmPaymentStatusChange(newStatus));
        setConfirmOpen(true);
    };

    const handleDeleteClick = () => {
        setConfirmTitle("Delete Order");
        setConfirmMessage(
            "Are you sure you want to delete this order? This action cannot be undone.",
        );
        setConfirmAction(() => () => confirmDelete());
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        console.log("Deleting order:", order);
        const promise = deleteOrder(order.id);
        try {
            await toast.promise(promise, {
                loading: "Deleting order...",
                success: "Order deleted successfully!",
                error: (err: Error) => `Failed to delete order: ${err.message}`,
            });
            // Close modal after deletion
            onClose();
        } catch (error) {
            console.error("Failed to delete order:", error);
        } finally {
            setConfirmOpen(false);
        }
    };

    const confirmPaymentStatusChange = async (newStatus: string) => {
        const promise = updateOrder(order.id, user.id, { paymentStatus: newStatus });

        try {
            await toast.promise(promise, {
                loading: "Updating payment status...",
                success: "Payment status updated successfully!",
                error: (err: Error) => `Failed to update payment status: ${err.message}`,
            });
            onPaymentStatusChange(order.id, newStatus);
        } catch (error) {
            console.error("Failed to update payment status:", error);
        } finally {
            setConfirmOpen(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditMode) {
            // Cancel editing - reset fields
            setEditedCustomer({
                fullName: order.customer?.fullName || "",
                email: order.customer?.email || "",
                phoneNumber: order.customer?.phoneNumber || "",
                headSize: order.customer?.headSize || "",
            });
            setEditedDeliveryMethod(order.deliveryMethod || "DELIVERY");
            setEditedNotes(order.notes || "");
            setEditedWigger(order.wigger?.name || "");
            setSelectedCustomerId(order.customer?.id || "");
            setIsAddingNewAddress(false);
            setNewAddress({ address: "", isPrimary: false });
            setIsNewCustomerMode(false);
        }
        setIsEditMode(!isEditMode);
    };

    const handleSearchCustomer = async () => {
        if (!searchQuery.trim()) {
            toast.error("Please enter a search query");
            return;
        }

        setIsSearching(true);
        try {
            const { data } = await db.queryOnce({
                Customers: {
                    $: searchType
                        ? { where: { [searchType]: searchQuery.trim() } }
                        : { where: { id: "" } },
                    addresses: {},
                },
            });

            if (data.Customers && data.Customers.length > 0) {
                const foundCustomer = data.Customers[0];
                setSelectedCustomerId(foundCustomer.id);
                setEditedCustomer({
                    fullName: foundCustomer.fullName || "",
                    email: foundCustomer.email || "",
                    phoneNumber: foundCustomer.phoneNumber || "",
                    headSize: foundCustomer.headSize || "",
                });
                setIsNewCustomerMode(false);
                toast.success("Customer found!");
                setSearchQuery("");
            } else {
                // Customer not found - activate new customer mode
                setSelectedCustomerId("");
                setEditedCustomer({
                    fullName: "",
                    email: searchType === "email" ? searchQuery.trim() : "",
                    phoneNumber: searchType === "phoneNumber" ? searchQuery.trim() : "",
                    headSize: "",
                });
                setIsNewCustomerMode(true);
                toast.success("Customer not found. Creating new customer with provided info.");
                setSearchQuery("");
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("Failed to search for customer");
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddNewAddress = () => {
        setIsAddingNewAddress(true);
        setNewAddress({ address: "", isPrimary: false });
    };

    const handleCancelNewAddress = () => {
        setIsAddingNewAddress(false);
        setNewAddress({ address: "", isPrimary: false });
    };

    const handleNewCustomer = () => {
        setSelectedCustomerId("");
        setEditedCustomer({
            fullName: "",
            email: "",
            phoneNumber: "",
            headSize: "",
        });
        setIsNewCustomerMode(true);
        setIsAddingNewAddress(false);
        toast.success("New customer mode activated. Fill in the details below.");
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);

        try {
            let finalCustomerId = selectedCustomerId;
            let customerChanged = false;

            // Determine if we need to create a new customer
            const isNewCustomer =
                isNewCustomerMode ||
                (!selectedCustomerId &&
                    (editedCustomer.fullName ||
                        editedCustomer.email ||
                        editedCustomer.phoneNumber ||
                        editedCustomer.headSize));

            // Create new customer if needed
            if (isNewCustomer) {
                try {
                    const createdCustomer = await createCustomer({
                        fullName: editedCustomer.fullName,
                        email: editedCustomer.email,
                        phoneNumber: editedCustomer.phoneNumber,
                        headSize: editedCustomer.headSize,
                        newAddress: isAddingNewAddress && newAddress.address ? newAddress : null,
                    });
                    finalCustomerId = createdCustomer.id;
                    customerChanged = true;
                    toast.success("Customer created successfully");
                } catch (error) {
                    console.error(error);
                    toast.error("Failed to create customer");
                    setIsSaving(false);
                    return;
                }
            } else if (selectedCustomerId) {
                // Handle new address for existing customer
                if (isAddingNewAddress && newAddress.address) {
                    try {
                        await updateCustomer(selectedCustomerId, {
                            newAddress: {
                                address: newAddress.address,
                                isPrimary: newAddress.isPrimary,
                            },
                        });
                        toast.success("Address added successfully");
                    } catch (error) {
                        console.error(error);
                        toast.error("Failed to update customer with new address");
                        setIsSaving(false);
                        return;
                    }
                }

                // Check if customer was changed to a different one
                if (selectedCustomerId !== order.customer?.id) {
                    customerChanged = true;
                }
            }

            // Prepare order updates
            const updates: Partial<Order> = {};

            // Add customerId to updates if customer changed
            if (customerChanged && finalCustomerId) {
                updates.customerId = finalCustomerId;
            }

            if (editedDeliveryMethod !== order.deliveryMethod) {
                updates.deliveryMethod = editedDeliveryMethod as "PICKUP" | "DELIVERY";
            }

            if (editedNotes !== order.notes) {
                updates.notes = editedNotes;
            }

            if (editedWigger !== (order.wigger?.name || "")) {
                (updates as any).wigger = editedWigger || undefined;
            }

            // Update the order - only send customerId and customerChanged flag
            const promise = updateOrder(order.id, user.id, updates, customerChanged);

            await toast.promise(promise, {
                loading: "Saving changes...",
                success: "Order updated successfully!",
                error: (err: Error) => `Failed to update order: ${err.message}`,
            });

            setIsEditMode(false);
            setIsAddingNewAddress(false);
            // Refresh the order data by closing and potentially reopening
            onClose();
        } catch (error) {
            console.error("Failed to save changes:", error);
            toast.error("Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadReceipt = async () => {
        const promise = downloadReceipt(order.id);
        try {
            await toast.promise(promise, {
                loading: "Downloading receipt...",
                success: "Receipt downloaded successfully!",
                error: (err: Error) => `Failed to download receipt: ${err.message}`,
            });
        } catch (error) {
            console.error("Failed to download receipt:", error);
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} title={`Order #${order.orderNumber}`} onClose={onClose}>
                <div className="p-4">
                    {user.role === "SUPER_ADMIN" && (
                        <div className="flex justify-end mb-4 space-x-2">
                            {!isEditMode ? (
                                <>
                                    <button
                                        onClick={handleEditToggle}
                                        className="inline-flex items-center px-3 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50"
                                    >
                                        <Edit size={16} className="mr-2" />
                                        Edit Order
                                    </button>
                                    <button
                                        onClick={handleDeleteClick}
                                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                    >
                                        Delete Order
                                    </button>
                                </>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleSaveChanges}
                                        disabled={isSaving}
                                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                                    >
                                        <Save size={16} className="mr-2" />
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </button>
                                    <button
                                        onClick={handleEditToggle}
                                        disabled={isSaving}
                                        className="inline-flex items-center px-3 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50"
                                    >
                                        <X size={16} className="mr-2" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-zinc-900 mb-3">
                                Customer Details
                            </h3>
                            {isEditMode ? (
                                <div className="space-y-3">
                                    {/* Customer Search */}
                                    <div className="p-3 bg-zinc-50 rounded-md">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                                            Search Customer
                                        </label>
                                        <div className="flex space-x-2 mb-2">
                                            <select
                                                value={searchType}
                                                onChange={(e) =>
                                                    setSearchType(
                                                        e.target.value as CustomerSearchType,
                                                    )
                                                }
                                                className="px-2 py-1 border border-zinc-300 rounded-md text-sm"
                                            >
                                                <option value="email">Email</option>
                                                <option value="phoneNumber">Phone</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder={`Search by ${searchType}...`}
                                                className="flex-1 px-3 py-1 border border-zinc-300 rounded-md text-sm"
                                                onKeyDown={(e) =>
                                                    e.key === "Enter" && handleSearchCustomer()
                                                }
                                            />
                                            <button
                                                onClick={handleSearchCustomer}
                                                disabled={isSearching}
                                                className="px-3 py-1 bg-zinc-600 text-white rounded-md hover:bg-zinc-700 disabled:bg-zinc-400 text-sm"
                                            >
                                                <Search size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Customer Selection Dropdown */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-sm font-medium text-zinc-700">
                                                Select Customer
                                            </label>
                                            <button
                                                onClick={handleNewCustomer}
                                                className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                                            >
                                                <PlusCircle size={14} className="mr-1" />
                                                New Customer
                                            </button>
                                        </div>
                                        <select
                                            value={isNewCustomerMode ? "NEW" : selectedCustomerId}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === "NEW") {
                                                    handleNewCustomer();
                                                } else {
                                                    setSelectedCustomerId(value);
                                                    setIsNewCustomerMode(false);
                                                }
                                            }}
                                            className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                                        >
                                            <option value="">-- Select a customer --</option>
                                            <option
                                                value="NEW"
                                                className="font-medium text-indigo-600"
                                            >
                                                + New Customer
                                            </option>
                                            {allCustomers.map((c: any) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.fullName} ({c.email})
                                                </option>
                                            ))}
                                        </select>
                                        {isNewCustomerMode && (
                                            <p className="mt-1 text-xs text-indigo-600">
                                                ✓ New customer mode active - fill in details below
                                            </p>
                                        )}
                                    </div>

                                    {/* Customer Info Fields */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editedCustomer.fullName}
                                            onChange={(e) =>
                                                setEditedCustomer({
                                                    ...editedCustomer,
                                                    fullName: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={editedCustomer.email}
                                            onChange={(e) =>
                                                setEditedCustomer({
                                                    ...editedCustomer,
                                                    email: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={editedCustomer.phoneNumber}
                                            onChange={(e) =>
                                                setEditedCustomer({
                                                    ...editedCustomer,
                                                    phoneNumber: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700">
                                            Head Size
                                        </label>
                                        <input
                                            type="text"
                                            value={editedCustomer.headSize}
                                            onChange={(e) =>
                                                setEditedCustomer({
                                                    ...editedCustomer,
                                                    headSize: e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                                        />
                                    </div>

                                    {/* Address Management */}
                                    {isNewCustomerMode && (
                                        <div className="mt-4 p-3 bg-indigo-50 rounded-md">
                                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                                Address (Optional)
                                            </label>
                                            <textarea
                                                value={newAddress.address || ""}
                                                onChange={(e) =>
                                                    setNewAddress({
                                                        ...newAddress,
                                                        address: e.target.value,
                                                    })
                                                }
                                                rows={2}
                                                placeholder="Enter address for new customer..."
                                                className="block w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                                            />
                                            <div className="flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    checked={newAddress.isPrimary || false}
                                                    onChange={(e) =>
                                                        setNewAddress({
                                                            ...newAddress,
                                                            isPrimary: e.target.checked,
                                                        })
                                                    }
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-300 rounded"
                                                />
                                                <label className="ml-2 text-sm text-zinc-700">
                                                    Set as primary address
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                    {selectedCustomer && !isNewCustomerMode && (
                                        <div className="mt-4 p-3 bg-zinc-50 rounded-md">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-medium text-zinc-700">
                                                    Address
                                                </label>
                                                <button
                                                    onClick={handleAddNewAddress}
                                                    disabled={isAddingNewAddress}
                                                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-zinc-600 hover:bg-zinc-700 rounded-md disabled:bg-zinc-400"
                                                >
                                                    <PlusCircle size={14} className="mr-1" />
                                                    Add New
                                                </button>
                                            </div>

                                            {isAddingNewAddress ? (
                                                <div className="space-y-2">
                                                    <textarea
                                                        value={newAddress.address}
                                                        onChange={(e) =>
                                                            setNewAddress({
                                                                ...newAddress,
                                                                address: e.target.value,
                                                            })
                                                        }
                                                        rows={2}
                                                        placeholder="Enter new address..."
                                                        className="block w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                                                    />
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={newAddress.isPrimary || false}
                                                            onChange={(e) =>
                                                                setNewAddress({
                                                                    ...newAddress,
                                                                    isPrimary: e.target.checked,
                                                                })
                                                            }
                                                            className="h-4 w-4 text-zinc-600 focus:ring-zinc-500 border-zinc-300 rounded"
                                                        />
                                                        <label className="ml-2 text-sm text-zinc-700">
                                                            Set as primary address
                                                        </label>
                                                    </div>
                                                    <button
                                                        onClick={handleCancelNewAddress}
                                                        className="text-xs text-zinc-600 hover:text-zinc-800"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : selectedCustomer.addresses &&
                                              selectedCustomer.addresses.length > 0 ? (
                                                <select
                                                    value={selectedAddressId}
                                                    onChange={(e) =>
                                                        setSelectedAddressId(e.target.value)
                                                    }
                                                    className="block w-full px-3 py-2 border border-zinc-300 rounded-md text-sm"
                                                >
                                                    {selectedCustomer.addresses.map((addr: any) => (
                                                        <option key={addr.id} value={addr.id}>
                                                            {addr.address}{" "}
                                                            {addr.isPrimary ? "(Primary)" : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <p className="text-sm text-zinc-500 italic">
                                                    No addresses available
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <p>
                                        <strong>Name:</strong> {order.customer?.fullName}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {order.customer?.email}
                                    </p>
                                    <p>
                                        <strong>Phone:</strong> {order.customer?.phoneNumber}
                                    </p>
                                    <p>
                                        <strong>Head Size:</strong> {order.customer?.headSize}
                                    </p>
                                    <p>
                                        <strong>Address:</strong>{" "}
                                        {(() => {
                                            const addrs = selectedCustomer?.addresses || [];
                                            const primary =
                                                addrs.find((a: CustomerAddress) => a.isPrimary) ||
                                                addrs[0];
                                            return primary ? (
                                                <span>
                                                    {primary.address}{" "}
                                                    {primary.isPrimary ? "(Primary)" : ""}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-zinc-500 italic">
                                                    No address on file
                                                </span>
                                            );
                                        })()}
                                    </p>
                                </>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-zinc-900 mb-3">
                                Order Information
                            </h3>
                            <p>
                                <strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}
                            </p>
                            {isEditMode ? (
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-zinc-700">
                                        Delivery Method
                                    </label>
                                    <select
                                        value={editedDeliveryMethod}
                                        onChange={(e) => setEditedDeliveryMethod(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                                    >
                                        <option value="pickup">Pickup</option>
                                        <option value="delivery">Delivery</option>
                                    </select>
                                </div>
                            ) : (
                                <p>
                                    <strong>Delivery Method:</strong> {order.deliveryMethod}
                                </p>
                            )}
                            {isEditMode ? (
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-zinc-700">
                                        Wigger
                                    </label>
                                    <input
                                        type="text"
                                        value={editedWigger}
                                        onChange={(e) => setEditedWigger(e.target.value)}
                                        placeholder="Enter wigger"
                                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                                    />
                                </div>
                            ) : (
                                <p>
                                    <strong>Wigger:</strong> {order.wigger?.name || "N/A"}
                                </p>
                            )}
                            <p>
                                <strong>Created At:</strong>{" "}
                                {new Date(order.createdAt).toLocaleString()}
                            </p>
                            <p>
                                <strong>Last Updated:</strong>{" "}
                                {new Date(order.updatedAt).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-zinc-900">Status</h3>
                            <div className="flex space-x-4">
                                <div className="mt-2 flex-1">
                                    <label
                                        htmlFor="orderStatus"
                                        className="block text-sm font-medium text-zinc-700"
                                    >
                                        Order Status
                                    </label>
                                    <select
                                        id="orderStatus"
                                        name="orderStatus"
                                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm disabled:bg-zinc-100 disabled:cursor-not-allowed"
                                        value={order.orderStatus}
                                        onChange={handleOrderStatusChange}
                                        disabled={isEditMode}
                                    >
                                        {ORDER_STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-2 flex-1">
                                    <label
                                        htmlFor="paymentStatus"
                                        className="block text-sm font-medium text-zinc-700"
                                    >
                                        Payment Status
                                    </label>
                                    <select
                                        id="paymentStatus"
                                        name="paymentStatus"
                                        className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm disabled:bg-zinc-100 disabled:cursor-not-allowed"
                                        value={order.paymentStatus}
                                        onChange={handlePaymentStatusChange}
                                        disabled={isEditMode}
                                    >
                                        {PAYMENT_STATUSES.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-zinc-900 mb-2">Notes</h3>
                            {isEditMode ? (
                                <textarea
                                    value={editedNotes}
                                    onChange={(e) => setEditedNotes(e.target.value)}
                                    rows={3}
                                    className="block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                                    placeholder="Add notes for this order..."
                                />
                            ) : (
                                <p className="mt-1 text-sm text-zinc-600 whitespace-pre-wrap">
                                    {order.notes || "No notes for this order."}
                                </p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-zinc-900">Order Items</h3>
                            <div className="overflow-x-auto mt-2">
                                <table className="min-w-full divide-y divide-zinc-200">
                                    <thead className="bg-zinc-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Item
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Quantity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {order.items.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                                    {item.quantity}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                                    ${item.price.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                                    ${(item.quantity * item.price).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        {/* Duplicate Save/Cancel here so buttons appear both top and bottom */}
                        {user.role === "SUPER_ADMIN" && isEditMode && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleSaveChanges}
                                    disabled={isSaving}
                                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                                >
                                    <Save size={16} className="mr-2" />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    onClick={handleEditToggle}
                                    disabled={isSaving}
                                    className="inline-flex items-center px-3 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50"
                                >
                                    <X size={16} className="mr-2" />
                                    Cancel
                                </button>
                            </div>
                        )}

                        {order.paymentStatus === "PAID" && (
                            <button
                                type="button"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                onClick={handleDownloadReceipt}
                            >
                                Receipt
                            </button>
                        )}
                        <button
                            type="button"
                            className="px-4 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
            <ConfirmDialog
                isOpen={isConfirmOpen}
                title={confirmTitle}
                message={confirmMessage}
                onConfirm={() => {
                    if (confirmAction) {
                        confirmAction();
                    }
                }}
                onClose={() => setConfirmOpen(false)}
            />
        </>
    );
};

export default OrderDetailsModal;
