/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import db from "../instant";
import type { Order, User } from "../types";
import AdminLayout from "../components/layouts/AdminLayout";
import LoadingIndicator from "../components/common/LoadingIndicator";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";

const ViewOrdersPage: React.FC<any> = ({ user, onLogout }) => {
  const { isLoading, error, data } = db.useQuery({
    Orders: {
      customer: {},
      posOperator: {},
    },
    Users: {},
  });

  console.log("Orders from VOP: ", { data });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState({
    paymentStatus: "",
    deliveryMethod: "",
    orderStatus: "",
    customer: "",
    posOperator: "",
    createdAtStart: "",
    createdAtEnd: "",
    updatedAtStart: "",
    updatedAtEnd: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
    let orders = (data?.Orders as Order[]) || [];

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

    return orders;
  }, [data?.Orders, filters]);

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <div className="md:col-span-3 grid grid-cols-3 gap-4"></div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
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
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
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
                      POS Operator
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                    >
                      Total Amount
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
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">
                        {elipsify(order.orderNumber, 10)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {order.customer?.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {order.posOperator?.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                        {order.totalAmount}
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
