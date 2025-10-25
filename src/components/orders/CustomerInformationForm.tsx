import React, { useState, useEffect } from "react";
import type {
  Customer,
  CustomerAddress,
  CustomerSearchType,
} from "../../types";
import { PlusCircle, Search } from "lucide-react";
import Tooltip from "../common/Tooltip";

interface CustomerInformationFormProps {
  customer: Partial<Customer>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFindCustomer: (query: string, type: CustomerSearchType) => void;
  handleCustomerNewAddressChange: (address: Partial<CustomerAddress> | null) => void;
}

const CustomerInformationForm: React.FC<CustomerInformationFormProps> = ({
  customer,
  handleChange,
  onFindCustomer,
  handleCustomerNewAddressChange,
}) => {
  const [selectedAddress, setSelectedAddress] =
    useState<Partial<CustomerAddress> | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);

  useEffect(() => {
    if (customer && customer.addresses && customer.addresses.length > 0) {
      setHasAddress(true);
    } else {
      setHasAddress(false);
    }
  }, [customer]);

  useEffect(() => {
    if (customer.addresses && customer.addresses.length > 0) {
      setHasAddress(true);
      const primaryAddress =
        customer.addresses.find((a) => a.isPrimary) || customer.addresses[0];
      setSelectedAddress(primaryAddress);
    } else {
      setSelectedAddress(null);
    }
  }, [customer.addresses]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSelectedAddress((prev) => ({ ...prev, address: e.target.value }));
  };

  const handleIsPrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAddress((prev) => ({ ...prev, isPrimary: e.target.checked }));
  };

  const handleAddNewAddress = () => {
    setIsAddingNewAddress(true);
    setHasAddress(false);
    setSelectedAddress({ address: "", isPrimary: false });
  };

  const onSaveAddress = async (address: Partial<CustomerAddress>) => {
    try {
      handleCustomerNewAddressChange({
        address: address.address,
        isPrimary: address.isPrimary,
      });
      setIsAddingNewAddress(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveAddress = () => {
    if (selectedAddress) {
      onSaveAddress(selectedAddress);
    }
  };

  const handleCancelAddAddress = () => {
    setIsAddingNewAddress(false);
    const primaryAddress =
      customer.addresses?.find((a) => a.isPrimary) || customer.addresses?.[0];
    setSelectedAddress(primaryAddress || null);
    handleCustomerNewAddressChange(null);
  };

  const addressToString = (address: Partial<CustomerAddress>) => {
    return `${address.address || ""}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <h2 className="text-lg font-medium mb-4">Customer Information</h2>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="email"
              id="email"
              value={customer.email}
              onChange={handleChange}
              className="flex-1 block w-full rounded-none rounded-l-md pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
              onClick={() => onFindCustomer(customer.email || "", "email")}
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
            >
              <Tooltip content="Search by email">
                <Search size={16} />
              </Tooltip>
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="tel"
              id="phoneNumber"
              value={customer.phoneNumber}
              onChange={handleChange}
              className="flex-1 block w-full rounded-none rounded-l-md pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
              onClick={() =>
                onFindCustomer(customer.phoneNumber || "", "phoneNumber")
              }
              className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
            >
              <Tooltip content="Search by phone number">
                <Search size={16} />
              </Tooltip>
            </button>
          </div>
        </div>
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={customer.fullName}
            onChange={handleChange}
            className="flex-1 block w-full rounded-none rounded-l-md pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="headSize"
            className="block text-sm font-medium text-gray-700"
          >
            Head Size
          </label>
          <input
            type="text"
            id="headSize"
            value={customer.headSize}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="address-select"
            className="block text-sm font-medium text-gray-700"
          >
            Select Address
          </label>
          <div className="flex items-center space-x-2">
            <select
              id="address-select"
              onChange={(e) => {
                const selected = customer.addresses?.find(
                  (a) => a.id === e.target.value
                );
                setSelectedAddress(selected || null);
                setIsAddingNewAddress(false);
                handleCustomerNewAddressChange(null);        
              }}
              value={selectedAddress?.id || ""}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {customer.addresses?.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addressToString(addr)}
                </option>
              ))}
            </select>
            <Tooltip content="Add new address">
              <button
                onClick={handleAddNewAddress}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusCircle size={20} />
              </button>
            </Tooltip>
          </div>
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <textarea
            id="address"
            rows={3}
            value={selectedAddress?.address || ""}
            onChange={handleAddressChange}
            readOnly={!isAddingNewAddress || hasAddress}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
          <div className="flex items-center mt-2">
            <input
              id="isPrimary"
              name="isPrimary"
              type="checkbox"
              checked={selectedAddress?.isPrimary || false}
              onChange={handleIsPrimaryChange}
              disabled={!isAddingNewAddress || hasAddress}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border border-gray-300 rounded"
            />
            <label
              htmlFor="isPrimary"
              className="ml-2 block text-sm text-gray-900"
            >
              Preferred Address
            </label>
          </div>
        </div>
        {isAddingNewAddress && (
          <div className="flex justify-end space-x-2">
            <Tooltip content="Save new address">
              <button
                onClick={handleSaveAddress}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Done
              </button>
            </Tooltip>
            <Tooltip content="Cancel adding address">
              <button
                onClick={handleCancelAddAddress}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerInformationForm;
