/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { toast } from 'react-hot-toast';
import type { Order, User } from '../../types';
import Modal from '../common/Modal';
import { updateOrder } from '../../api/orders';

interface OrderDetailsModalProps {
  isOpen: boolean;
  order: Order;
  user: User;
  onClose: () => void;
  onOrderStatusChange: (orderId: string, status: string) => void;
  onPaymentStatusChange: (orderId: string, status: string) => void;
}

const ORDER_STATUSES = ['CREATED', 'IN PROGRESS', 'COMPLETED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID'];

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  order,
  user,
  onClose,
  onOrderStatusChange,
  onPaymentStatusChange,
}) => {
  if (!order) return null;

  const handleOrderStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const promise = updateOrder(order.id, user.id, { orderStatus: newStatus });

    toast.promise(promise, {
      loading: 'Updating order status...',
      success: 'Order status updated successfully!',
      error: 'Failed to update order status.',
    });

    try {
      await promise;
      onOrderStatusChange(order.id, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handlePaymentStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const promise = updateOrder(order.id, user.id, { paymentStatus: newStatus });

    toast.promise(promise, {
      loading: 'Updating payment status...',
      success: 'Payment status updated successfully!',
      error: 'Failed to update payment status.',
    });

    try {
      await promise;
      onPaymentStatusChange(order.id, newStatus);
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} title={`Order #${order.orderNumber}`} onClose={onClose}>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-900">Customer Details</h3>
            <p><strong>Name:</strong> {order.customer?.fullName}</p>
            <p><strong>Email:</strong> {order.customer?.email}</p>
            <p><strong>Phone:</strong> {order.customer?.phoneNumber}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-zinc-900">Order Information</h3>
            <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
            <p><strong>Delivery Method:</strong> {order.deliveryMethod}</p>
            <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Last Updated:</strong> {new Date(order.updatedAt).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-zinc-900">Status</h3>
            <div className="flex space-x-4">
              <div className="mt-2 flex-1">
                <label htmlFor="orderStatus" className="block text-sm font-medium text-zinc-700">
                  Order Status
                </label>
                <select
                  id="orderStatus"
                  name="orderStatus"
                  className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                  value={order.orderStatus}
                  onChange={handleOrderStatusChange}
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-2 flex-1">
                <label htmlFor="paymentStatus" className="block text-sm font-medium text-zinc-700">
                  Payment Status
                </label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  className="mt-1 block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm focus:outline-none focus:ring-zinc-500 focus:border-zinc-500 sm:text-sm"
                  value={order.paymentStatus}
                  onChange={handlePaymentStatusChange}
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
            <h3 className="text-lg font-medium text-zinc-900">Notes</h3>
            <p className="mt-1 text-sm text-zinc-600 whitespace-pre-wrap">{order.notes || 'No notes for this order.'}</p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-zinc-900">Order Items</h3>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full divide-y divide-zinc-200">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
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
  );
};

export default OrderDetailsModal;
