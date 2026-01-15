/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect, useRef } from "react";
import db from "../instant";
import type { Order, User } from "../types";
import AdminLayout from "../components/layouts/AdminLayout";
import LoadingIndicator from "../components/common/LoadingIndicator";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import { Check, X } from "lucide-react";
import { updateOrder } from "../api/orders";
import { toast } from "react-hot-toast";

const ViewOrdersPage: React.FC<any> = ({ user, onLogout }) => {
  const { isLoading, error, data } = db.useQuery({
    Orders: {
      customer: {},
      posOperator: {},
      wigger: {},
    },
    Users: {},

  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState({
    paymentStatus: "",
    deliveryMethod: "",
    orderStatus: "",
    customer: "",
    orderNumber: "",
    wigger: "",
    posOperator: "",
    createdAtStart: "",
    createdAtEnd: "",
    updatedAtStart: "",
    updatedAtEnd: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Hover popup state
  const hoverTimerRef = useRef<number | null>(null);
  const [hoveredOrder, setHoveredOrder] = useState<Order | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inline wigger edit state
  const [editingWiggerId, setEditingWiggerId] = useState<string | null>(null);
  const [wiggerForEdit, setWiggerForEdit] = useState("");
  const [savingWiggerId, setSavingWiggerId] = useState<string | null>(null);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setCurrentPage(1); // Reset to first page on filter change
  };

  const filteredOrders = useMemo(() => {
    let orders = ((data as any)?.Orders as Order[]) || [];

    if (filters.paymentStatus) {
      orders = orders.filter((o) => o.paymentStatus === filters.paymentStatus);
    }
    if (filters.deliveryMethod) {
      orders = orders.filter(
        (o) => o.deliveryMethod === filters.deliveryMethod
      );
    }
    if (filters.orderStatus) {
      orders = orders.filter((o) => o.orderStatus === filters.orderStatus);
    }
    if (filters.customer) {
      orders = orders.filter((o) =>
        o.customer?.fullName
          .toLowerCase()
          .includes(filters.customer.toLowerCase())
      );
    }
    if (filters.orderNumber) {
      orders = orders.filter((o) =>
        (o.orderNumber || "").toLowerCase().includes(filters.orderNumber.toLowerCase())
      );
    }
    if (filters.wigger) {
      orders = orders.filter((o) =>
        (o.wigger?.name || "").toLowerCase().includes(filters.wigger.toLowerCase())
      );
    }
    if (filters.posOperator) {
      orders = orders.filter((o) => o.posOperator?.id === filters.posOperator);
    }
    if (filters.createdAtStart) {
      orders = orders.filter(
        (o) => new Date(o.createdAt) >= new Date(filters.createdAtStart)
      );
    }
    if (filters.createdAtEnd) {
      const endDate = new Date(filters.createdAtEnd);
      endDate.setHours(23, 59, 59, 999);
      orders = orders.filter((o) => new Date(o.createdAt) <= endDate);
    }

    if (filters.updatedAtStart) {
      orders = orders.filter(
        (o) => new Date(o.updatedAt) >= new Date(filters.updatedAtStart)
      );
    }
    if (filters.updatedAtEnd) {
      const endDate = new Date(filters.updatedAtEnd);
      endDate.setHours(23, 59, 59, 999);
      orders = orders.filter((o) => new Date(o.updatedAt) <= endDate);
    }

    // Sort by most recent on top
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  }, [(data as any)?.Orders, filters]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
  };

  // Hover handlers for delayed popup (2.5s)
  const handleRowMouseEnter = (order: Order, e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setPopupPos({ x: clientX, y: clientY });
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = window.setTimeout(() => {
      setHoveredOrder(order);
      hoverTimerRef.current = null;
    }, 1500);
  };

  const handleRowMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setPopupPos({ x: clientX, y: clientY });
  };

  const handleRowMouseLeave = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredOrder(null);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleOrderStatusChange = (orderId: string, status: string) => {
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: status });
    }
  };

  const handlePaymentStatusChange = (orderId: string, status: string) => {
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: status });
    }
  };

  const handleWiggerEdit = (orderId: string, currentWigger: string) => {
    setEditingWiggerId(orderId);
    setWiggerForEdit(currentWigger || "");
  };

  const handleWiggerSave = async (orderId: string) => {
    setSavingWiggerId(orderId);
    try {
      await updateOrder(orderId, user.id, { wigger: wiggerForEdit || undefined } as any);
      toast.success("Wigger updated successfully!");
      setEditingWiggerId(null);
    } catch (error) {
      console.error("Failed to update wigger:", error);
      toast.error("Failed to update wigger");
    } finally {
      setSavingWiggerId(null);
    }
  };

  const handleWiggerCancel = () => {
    setEditingWiggerId(null);
    setWiggerForEdit("");
  };

  const users = (data?.Users as User[]) || [];

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "CREATED":
        return "bg-gray-50";
      case "IN PROGRESS":
        return "bg-blue-100";
      case "COMPLETED":
        return "bg-green-100";
      case "DISPATCHED":
        return "bg-yellow-100";
      case "DELIVERED":
        return "bg-green-200";
      case "CANCELLED":
        return "bg-red-100";
      case "RETURNED":
        return "bg-red-200";
      default:
        return "";
    }
  };

  const elipsify = (str: string, length: number) => {
    if (str.length > length) {
      return str.slice(0, length) + "...";
    }
    return str;
  };

  const [showFilters, setShowFilters] = useState(false);

  return (
    <AdminLayout pageTitle="View Orders" user={user} onLogout={onLogout}>
      {isLoading && <LoadingIndicator />}
      {error && (
        <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md mb-4">
          Error: {error?.message}
        </p>
      )}
      <div className="p-4">
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <button 
            className="md:hidden mb-4 w-full px-4 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${showFilters ? 'block' : 'hidden'} md:grid`}>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Delivery Method
              </label>
              <select
                name="deliveryMethod"
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Order Status
              </label>
              <select
                name="orderStatus"
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              >
                <option value="">All</option>
                <option value="CREATED">Created</option>
                <option value="IN PROGRESS">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                POS Operator
              </label>
              <select
                name="posOperator"
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              >
                <option value="">All</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Order Number
              </label>
              <input
                type="text"
                name="orderNumber"
                placeholder="Filter by order number..."
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Customer
              </label>
              <input
                type="text"
                name="customer"
                placeholder="Filter by customer..."
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Wigger
              </label>
              <input
                type="text"
                name="wigger"
                placeholder="Filter by wigger..."
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              />
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Created At (Start)
              </label>
              <input
                type="date"
                name="createdAtStart"
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Created At (End)
              </label>
              <input
                type="date"
                name="createdAtEnd"
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Updated At (Start)
              </label>
              <input
                type="date"
                name="updatedAtStart"
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Updated At (End)
              </label>
              <input
                type="date"
                name="updatedAtEnd"
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <p>Loading orders...</p>
        ) : (
          <>
            <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                    >
                      Order Number
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                    >
                      Wigger
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                    >
                      POS Operator
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                    >
                      Payment Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                    >
                      Order Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                    >
                      Delivery Method
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                    >
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {currentItems.map((order) => (
                    <tr
                      key={order.id}
                      className={`cursor-pointer hover:bg-zinc-200 ${getOrderStatusColor(
                        order.orderStatus
                      )}`}
                      onClick={() => handleOrderClick(order)}
                      onMouseEnter={(e) => handleRowMouseEnter(order, e)}
                      onMouseMove={(e) => handleRowMouseMove(e)}
                      onMouseLeave={handleRowMouseLeave}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                        {elipsify(order.orderNumber, 10)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {order.customer?.fullName}
                      </td>
                      <td 
                        className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {editingWiggerId === order.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={wiggerForEdit}
                              onChange={(e) => setWiggerForEdit(e.target.value)}
                              disabled={savingWiggerId === order.id}
                              className="px-2 py-1 border border-zinc-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:bg-zinc-100"
                              autoFocus
                              placeholder="Enter wigger"
                            />
                            <button
                              onClick={() => handleWiggerSave(order.id)}
                              disabled={savingWiggerId === order.id}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded disabled:opacity-50"
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={handleWiggerCancel}
                              disabled={savingWiggerId === order.id}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <span 
                            onClick={() => handleWiggerEdit(order.id, order.wigger?.name || "")}
                            className="cursor-text hover:bg-zinc-100 px-2 py-1 rounded inline-block"
                            title="Click to edit"
                          >
                            {order.wigger?.name || "N/A"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {order.posOperator?.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {order.paymentStatus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {order.orderStatus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {order.deliveryMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Hover popup showing customer + items (appears after 2.5s) */}
            {hoveredOrder && (
              <div
                className="fixed z-50 w-80 max-w-xs bg-white rounded-md shadow-lg border p-3 text-sm"
                style={{ left: popupPos.x + 12, top: popupPos.y + 12 }}
              >
                <div className="font-semibold mb-1">Order</div>
                <div className="text-zinc-700 mb-1">#{hoveredOrder.orderNumber}</div>
                <div className="font-semibold mb-1">Customer</div>
                <div className="text-zinc-700">{hoveredOrder.customer?.fullName || "—"}</div>
                {hoveredOrder.customer?.email && (
                  <div className="text-zinc-500 text-xs">{hoveredOrder.customer.email}</div>
                )}
                {hoveredOrder.customer?.phoneNumber && (
                  <div className="text-zinc-500 text-xs">{hoveredOrder.customer.phoneNumber}</div>
                )}
                <div className="border-t mt-2 pt-2 font-semibold">Items</div>
                <div className="max-h-40 overflow-auto mt-1 space-y-1">
                  {(() => {
                    let items: any[] = [];
                    if (!hoveredOrder.items) return <div className="text-xs text-zinc-500">No items</div>;
                    try {
                      items = typeof hoveredOrder.items === "string" ? JSON.parse(hoveredOrder.items) : hoveredOrder.items;
                    } catch {
                      items = hoveredOrder.items as any[];
                    }
                    if (!Array.isArray(items)) return <div className="text-xs text-zinc-500">No items</div>;
                    return items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-zinc-700">
                        <div className="truncate pr-2">{it.name ?? it.description ?? JSON.stringify(it)}</div>
                        <div className="text-zinc-500">{it.qty ?? it.quantity ?? ""}{it.price ? ` × ${it.price}` : ""}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
      {selectedOrder && (
        <OrderDetailsModal
          isOpen={selectedOrder !== null}
          order={selectedOrder}
          user={user}
          onClose={handleCloseModal}
          onOrderStatusChange={handleOrderStatusChange}
          onPaymentStatusChange={handlePaymentStatusChange}
        />
      )}
    </AdminLayout>
  );
};

export default ViewOrdersPage;
