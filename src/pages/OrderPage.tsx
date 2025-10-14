import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layouts/AdminLayout';
import type { User, AttributeCategory } from '../types';
import type { Page } from '../App';
import { getCategories } from '../api/inventoryAttributes';

interface OrderPageProps {
  user: User;
  setCurrentPage: (page: Page) => void;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
}

const OrderPage: React.FC<OrderPageProps> = ({ user, setCurrentPage }) => {
  const [attributes, setAttributes] = useState<AttributeCategory[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const VAT_RATE = 0.20;

  useEffect(() => {
    const newSubtotal = orderItems.reduce((acc, item) => acc + item.price, 0);
    setSubtotal(newSubtotal);

    const newVat = newSubtotal * VAT_RATE;
    setVat(newVat);

    const newTotal = newSubtotal + newVat - discount + (orderType === 'delivery' ? deliveryCharge : 0);
    setTotalAmount(newTotal);

  }, [orderItems, discount, orderType, deliveryCharge]);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const fetchedAttributes = await getCategories();
        setAttributes(fetchedAttributes);
      } catch (error) {
        console.error('Error fetching attributes:', error);
      }
    };

    fetchAttributes();
  }, []);

  const handleOptionChange = (categoryId: string, itemId: string) => {
    setSelectedOptions((prev) => ({ ...prev, [categoryId]: itemId }));
  };

  const handleAddToOrder = () => {
    // This is a placeholder. In a real app, you'd get the product details based on selectedOptions
    const newItem: OrderItem = {
      id: Date.now().toString(),
      name: 'Dummy Product',
      price: Math.floor(Math.random() * 100) + 20, // Random price between 20 and 120
    };
    setOrderItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  return (
    <AdminLayout user={user} setCurrentPage={setCurrentPage} currentPage="orders" pageTitle="Order">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Order Creation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {attributes.map((category) => (
                <div key={category.id}>
                  <label htmlFor={`category-${category.id}`} className="block text-sm font-medium text-gray-700">{category.title}</label>
                  <select
                    id={`category-${category.id}`}
                    name={category.title}
                    value={selectedOptions[category.id] || ''}
                    onChange={(e) => handleOptionChange(category.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select {category.title}</option>
                    {category.items.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddToOrder}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add to Order
              </button>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Current Order</h3>
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span>${item.price.toFixed(2)}</span>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700">Remove</button>
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
                <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="customer-email" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"/>
              </div>
              <div>
                <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" id="customer-phone" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"/>
              </div>
              <div>
                <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="customer-name" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"/>
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
                  }`}>
                  Pickup
                </button>
                <button 
                  onClick={() => setOrderType('delivery')}
                  className={`w-full ml-2 flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    orderType === 'delivery' 
                      ? 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700' 
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}>
                  Delivery
                </button>
              </div>
              {orderType === 'delivery' && (
                <div>
                  <label htmlFor="delivery-charge" className="block text-sm font-medium text-gray-700">Delivery Charge</label>
                  <input 
                    type="number" 
                    id="delivery-charge" 
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(parseFloat(e.target.value))}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"/>
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
                  placeholder="$"/>
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