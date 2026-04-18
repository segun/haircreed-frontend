import React, { useState, useEffect } from "react";
import AdminLayout from "../components/layouts/AdminLayout";
import type {
  User,
  AttributeItem,
  InventoryItem,
  Customer,
  CustomerAddress,
  CustomerSearchType,
  Product,
} from "../types";
import db from "../instant";
import { createCustomer, updateCustomer } from "../api/customers";
import { toast } from "react-hot-toast";
import CustomerInformationForm from "../components/orders/CustomerInformationForm";
import { createOrder } from "../api/orders";
import LoadingIndicator from "../components/common/LoadingIndicator";
import { UseProductModal } from "../components/common/UseProductModal";
import { listProducts } from "../api/products";

interface OrderPageProps {
  user: User;
  onLogout: () => void;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string;
}

const OrderPage: React.FC<OrderPageProps> = ({ user, onLogout }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    isLoading: isDataLoading,
    error,
    data,
  } = db.useQuery({
    InventoryItems: {
      attributes: { category: {} },
      supplier: {},
    },
    AppSettings: {},
  });

  const [notes, setNotes] = useState("");
  const [wigger, setWigger] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [vat, setVat] = useState(0);
  const [customer, setCustomer] = useState<
    Partial<Customer> & {
      newAddress?: Partial<CustomerAddress> | null;
    }
  >({});
  const [isUseProductOpen, setIsUseProductOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductForUse, setSelectedProductForUse] = useState<Product | null>(null);
  const [customerQuery, setCustomerQuery] = useState<{
    query: string;
    type: CustomerSearchType;
  } | null>(null);

  const { data: customerData } = db.useQuery({
    Customers: {
      $: customerQuery
        ? { where: { [customerQuery.type]: customerQuery.query } }
        : { where: { id: "" } },
      addresses: {},
      orders: {},
    },
  });

  const handleFindCustomer = async (
    query: string,
    type: CustomerSearchType
  ): Promise<Partial<Customer> | null> => {
    setCustomerQuery({ query, type });

    try {
      const { data } = await db.queryOnce({
        Customers: {
          $:
            type && query
              ? { where: { [type]: query } }
              : { where: { id: "" } },
          addresses: {},
          orders: {},
        },
      });

      if (data.Customers && data.Customers.length > 0) {
        const found = (data.Customers[0] || {}) as Partial<Customer> & {
          newAddress?: Partial<CustomerAddress> | null;
        };
        setCustomer(found);
        toast.success("Customer found");
        return found;
      } else {
        const emptyCustomer: Partial<Customer> & {
          newAddress?: Partial<CustomerAddress> | null;
        } = {
          addresses: [],
          orders: [],
          fullName: "",
          email: "",
          phoneNumber: "",
          headSize: "",
          newAddress: null,
        };
        setCustomer(emptyCustomer);
        toast.error("Customer not found");
        return null;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to search for customer");
      return null;
    }
  };

  useEffect(() => {
    if (customerData?.Customers?.length) {
      setCustomer(
        customerData.Customers[0] as Partial<Customer> & {
          newAddress?: Partial<CustomerAddress> | null;
        }
      );
    }
  }, [customerData]);

  const [totalAmount, setTotalAmount] = useState(0);

  const handleCreateOrder = async () => {
    setIsProcessing(true);
    let customerToUse = customer;

    if (customerData?.Customers?.length) {
      customerToUse = customerData.Customers[0] as Partial<Customer> & {
        newAddress?: Partial<CustomerAddress> | null;
      };
    }

    if (!customerToUse || !customerToUse.id) {
      try {
        const createdCustomer =await createCustomer({
          ...customerToUse,
          newAddress: customer.newAddress || null,
        });
        customerToUse = createdCustomer;
        toast.success("Customer created successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to create customer");
        setIsProcessing(false);
        return;
      }
    } else {
      if (customer.newAddress && customer.newAddress.address) {
        // update customer with new address
        try {
          await updateCustomer(customerToUse.id, {
            newAddress: customer.newAddress,
          });
        } catch (error) {
          console.error(error);
          toast.error("Failed to update customer with new address");
          setIsProcessing(false);
          return;
        }
      }
    }

    if(!customerToUse.id) {
      toast.error("Customer information is incomplete");
      setIsProcessing(false);
      return;
    }
    
    const orderPayload = {
      customerId: customerToUse.id as string,
      posOperatorId: user.id,
      items: orderItems.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      status: "CREATED" as const,
      notes: orderItems.map((item) => item.notes).filter(Boolean).join(", "),
      wigger: wigger || undefined,
      orderType: orderType,
      deliveryCharge: deliveryCharge,
      discount: discount,
      vat: vat,
      orderNumber: `ORD-${new Date().getTime()}`,
      totalAmount: totalAmount,
      vatRate: data?.AppSettings?.[0]?.settings?.vatRate || 0,
    };

    try {
      await createOrder(orderPayload);
      toast.success("Order created successfully");
      setOrderItems([]);
      setCustomer({
        addresses: [],
        orders: [],
        fullName: "",
        email: "",
        phoneNumber: "",
        headSize: "",
        newAddress: null,
      });
      setNotes("");
      setWigger("");
      setDiscount(0);
      setDeliveryCharge(0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setCustomer((prev) => ({ ...prev, [id]: value }));
  };

  const handleCustomerNewAddress = (
    address: Partial<CustomerAddress> | null
  ) => {
    setCustomer((prev) => ({ ...prev, newAddress: address }));
  };

  const handleUseProductClick = (product: Product) => {
    setSelectedProductForUse(product);
    setIsUseProductOpen(true);
  };

  const handleUseProductSubmit = async () => {
    // Reload products after usage to reflect quantity changes
    try {
      const products = await listProducts();
      setAvailableProducts(products);
    } catch (err) {
      console.error('Failed to reload products:', err);
    }
  };

  const isCustomerInfoComplete = () => {
    return (
      customer.fullName &&
      customer.email &&
      customer.phoneNumber &&
      customer.headSize
    );
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<InventoryItem | null>(null);
  const [quantity, setQuantity] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const vatRate = data?.AppSettings?.[0]?.settings?.vatRate || 0;

  useEffect(() => {
    const newSubtotal = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setSubtotal(newSubtotal);

    const newVat = newSubtotal * (vatRate / 100);
    setVat(newVat);

    const newTotal =
      newSubtotal +
      newVat -
      discount +
      (orderType === "delivery" ? deliveryCharge : 0);
    setTotalAmount(newTotal);
  }, [orderItems, discount, orderType, deliveryCharge, vatRate]);

  // Load available products for UseProductModal
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await listProducts();
        setAvailableProducts(products);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    loadProducts();
  }, []);

  const getInventoryItemName = (attributes: AttributeItem[]) => {
    return attributes
      .map(attr => attr.category?.title ? `${attr.category.title}: ${attr.name}` : attr.name)
      .join(', ');
  };

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedInventoryItem(item);
    setPrice(item.costPrice || "");
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleAddItemToOrder = () => {
    if (!selectedInventoryItem || quantity === "" || price === "") return;

    const newOrderItem: OrderItem = {
      id: selectedInventoryItem.id,
      name: getInventoryItemName(selectedInventoryItem.attributes),
      price: price,
      quantity: quantity,
      notes: notes,
    };

    setOrderItems((prev) => [...prev, newOrderItem]);
    setSelectedInventoryItem(null);
    setQuantity("");
    setPrice("");
    setNotes("");
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  if (isDataLoading) return <LoadingIndicator />;
  if (error) return <div>Error: {error.message}</div>;

  // Normalize supplier and attribute categories to always be defined
  const inventoryItems: InventoryItem[] = (data?.InventoryItems || []).map(
    (item) =>
      ({
        ...item,
        supplier:
          item.supplier ?? {
            id: "",
            createdAt: 0,
            name: "",
            email: "",
            contactPerson: "",
            phoneNumber: "",
            address: "",
            notes: "",
          },
        attributes: (item.attributes || []).map((attr) => ({
          ...attr,
          category:
            attr.category ?? {
              id: "",
              createdAt: 0,
              updatedAt: 0,
              title: "",
            },
        })),
      } as InventoryItem)
  );

  const filteredInventoryItems = inventoryItems.filter((item) =>
    getInventoryItemName(item.attributes)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const isAddButtonDisabled =
    !selectedInventoryItem ||
    quantity === "" ||
    price === "" ||
    isNaN(Number(quantity)) ||
    isNaN(Number(price)) ||
    Number(quantity) > (selectedInventoryItem?.quantity ?? 0);

  return (
    <AdminLayout user={user} onLogout={onLogout} pageTitle="Order">
      {isProcessing ? (
        <LoadingIndicator />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-4">Create Order</h2>

              <div className="mb-4">
                <h3 className="text-md font-medium mb-2">Add Items to Order</h3>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-2 border rounded-md text-left"
                  >
                    {selectedInventoryItem
                      ? getInventoryItemName(selectedInventoryItem.attributes)
                      : "Select an item"}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full bg-white border rounded-md mt-1">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border-b"
                      />
                      <ul className="max-h-60 overflow-y-auto">
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
                    </div>
                  )}
                </div>

                {selectedInventoryItem && (
                  <div className="mt-4 p-4 border rounded-md bg-gray-50">
                    <div>
                      <p>
                        <span className="font-medium">Selected:</span>{" "}
                        {getInventoryItemName(selectedInventoryItem.attributes)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Available: {selectedInventoryItem.quantity}
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div>
                        <label
                          htmlFor="quantity"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                          className="mt-1 p-2 block w-full border rounded-md"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="price"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Price
                        </label>
                        <input
                          type="number"
                          id="price"
                          value={price}
                          onChange={(e) =>
                            setPrice(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value)
                            )
                          }
                          className="mt-1 p-2 block w-full border rounded-md"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="total"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Total
                        </label>
                        <div
                          id="total"
                          className="mt-1 p-2 block w-full border rounded-md bg-gray-100"
                        >
                          ${(Number(quantity) * Number(price)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Notes/Description
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                    <div
                      key={item.id}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center"
                    >
                      <span className="col-span-1 sm:col-span-2">{item.name}</span>
                      <span>Qty: {item.quantity}</span>
                      <div className="flex justify-between items-center">
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm sm:text-base"
                        >
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
            <CustomerInformationForm
              customer={customer}
              setCustomer={(c) =>
                setCustomer(
                  c ??
                    ({
                      addresses: [],
                      orders: [],
                      fullName: "",
                      email: "",
                      phoneNumber: "",
                      headSize: "",
                      newAddress: null,
                    } as Partial<Customer> & {
                      newAddress?: Partial<CustomerAddress> | null;
                    })
                )
              }
              handleChange={handleCustomerChange}
              onFindCustomer={handleFindCustomer}
              handleCustomerNewAddressChange={handleCustomerNewAddress}
            />
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-lg font-medium mb-4">Order Options</h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="wigger"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Wigger
                  </label>
                  <input
                    id="wigger"
                    type="text"
                    value={wigger}
                    onChange={(e) => setWigger(e.target.value)}
                    placeholder="Enter wigger"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex justify-around">
                  <button
                    onClick={() => setOrderType("pickup")}
                    className={`w-full mr-2 flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      orderType === "pickup"
                        ? "border-transparent text-white bg-indigo-600 hover:bg-indigo-700"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    Pickup
                  </button>
                  <button
                    onClick={() => setOrderType("delivery")}
                    className={`w-full ml-2 flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      orderType === "delivery"
                        ? "border-transparent text-white bg-indigo-600 hover:bg-indigo-700"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    Delivery
                  </button>
                </div>
                {orderType === "delivery" && (
                  <div>
                    <label
                      htmlFor="delivery-charge"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Delivery Charge
                    </label>
                    <input
                      type="number"
                      id="delivery-charge"
                      value={deliveryCharge}
                      onChange={(e) =>
                        setDeliveryCharge(parseFloat(e.target.value))
                      }
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
                  <span>VAT ({vatRate}%)</span>
                  <span>${vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discount</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    className="w-24 p-1 border rounded"
                    placeholder="$"
                  />
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span>${deliveryCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                {availableProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsUseProductOpen(true)}
                    className="w-full mt-3 flex justify-center py-2 px-4 border border-zinc-300 rounded-md shadow-sm text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
                  >
                    Use Product
                  </button>
                )}
                <button
                  onClick={handleCreateOrder}
                  disabled={
                    !isCustomerInfoComplete() || orderItems.length === 0
                  }
                  className="w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Use Product Modal */}
      {selectedProductForUse && (
        <UseProductModal
          isOpen={isUseProductOpen}
          product={selectedProductForUse}
          onSubmit={handleUseProductSubmit}
          onClose={() => {
            setIsUseProductOpen(false);
            setSelectedProductForUse(null);
          }}
        />
      )}

      {/* Product Selector Modal - for choosing which product to use */}
      {isUseProductOpen && !selectedProductForUse && availableProducts.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsUseProductOpen(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Select Product to Use</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableProducts.map(product => (
                    <button
                      key={product.id}
                      onClick={() => handleUseProductClick(product)}
                      className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">Available: {product.quantity} unit(s)</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setIsUseProductOpen(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrderPage;
