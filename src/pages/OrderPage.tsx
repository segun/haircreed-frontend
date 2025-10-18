import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layouts/AdminLayout';
import type { User, AttributeItem, InventoryItem } from '../types';
import db from '../instant';

interface OrderPageProps {
  user: User;
  onLogout: () => void;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const OrderPage: React.FC<OrderPageProps> = ({ user, onLogout }) => {
  const { isLoading, error, data } = db.useQuery({
    InventoryItems: {
      attributes: { category: {} },
      supplier: {},
    },
  });

  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');

  const VAT_RATE = 0.20;

  useEffect(() => {
    const newSubtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setSubtotal(newSubtotal);

    const newVat = newSubtotal * VAT_RATE;
    setVat(newVat);

    const newTotal = newSubtotal + newVat - discount + (orderType === 'delivery' ? deliveryCharge : 0);
    setTotalAmount(newTotal);
  }, [orderItems, discount, orderType, deliveryCharge]);

  const getInventoryItemName = (attributes: AttributeItem[]) => {
    return attributes.map((attr: AttributeItem) => attr.name).join(' - ');
  };

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setPrice(item.costPrice || '');
    setSearchTerm('');
  };

  const handleAddItemToOrder = () => {
    if (!selectedInventoryItem || quantity === '' || price === '') return;

    const newOrderItem: OrderItem = {
      id: selectedInventoryItem.id,
      name: getInventoryItemName(selectedInventoryItem.attributes),
      price: price,
      quantity: quantity,
    };

    setOrderItems((prev) => [...prev, newOrderItem]);
    setSelectedInventoryItem(null);
    setQuantity('');
    setPrice('');
    setNotes('');
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const inventoryItems = (data?.InventoryItems || []).map(item => ({
    ...item,
    supplier: item.supplier ?? {
      id: '',
      createdAt: 0,
      name: '',
      email: '',
      contactPerson: '',
      phoneNumber: '',
      address: '',
      notes: ''
    }
  }));

  const filteredInventoryItems = inventoryItems.filter((item) =>
    getInventoryItemName(item.attributes).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAddButtonDisabled =
    !selectedInventoryItem ||
    quantity === '' ||
    price === '' ||
    isNaN(Number(quantity)) ||
    isNaN(Number(price)) ||
    Number(quantity) > (selectedInventoryItem?.quantity ?? 0);

  return (
    <AdminLayout user={user} onLogout={onLogout} pageTitle="Order">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Create Order</h2>

            <div className="mb-4">
              <h3 className="text-md font-medium mb-2">Add Items to Order</h3>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for an item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                {searchTerm && (
                  <ul className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto">
                    {filteredInventoryItems.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="p-2 cursor-pointer hover:bg-gray-200"
                      >
                        {getInventoryItemName(item.attributes)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedInventoryItem && (
                <div className="mt-4 grid grid-cols-4 gap-4 items-center">
                  <div className="col-span-2">
                    <p>Selected: {getInventoryItemName(selectedInventoryItem.attributes)}</p>
                    <p className="text-sm text-gray-500">Available: {selectedInventoryItem.quantity}</p>
                  </div>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="p-2 border rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes/Description
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddItemToOrder}
                disabled={isAddButtonDisabled}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Current Order</h3>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-4 gap-4 items-center">
                    <span className="col-span-2">{item.name}</span>
                    <span>Qty: {item.quantity}</span>
                    <div className="flex justify-between">
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-lg font-medium mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="customer-email"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  id="customer-phone"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="customer-name"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Find Customer
              </button>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-lg font-medium mb-4">Order Options</h2>
            <div className="space-y-4">
              <div className="flex justify-around">
                <button
                  onClick={() => setOrderType('pickup')}
                  className={`w-full mr-2 flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    orderType === 'pickup'
                      ? 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Pickup
                </button>
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`w-full ml-2 flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    orderType === 'delivery'
                      ? 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  Delivery
                </button>
              </div>
              {orderType === 'delivery' && (
                <div>
                  <label htmlFor="delivery-charge" className="block text-sm font-medium text-gray-700">
                    Delivery Charge
                  </label>
                  <input
                    type="number"
                    id="delivery-charge"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(parseFloat(e.target.value))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT ({(VAT_RATE * 100).toFixed(0)}%)</span>
                <span>${vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Discount</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 p-1 border rounded"
                  placeholder="$"
                />
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>${deliveryCharge.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <button className="w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Create Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderPage;