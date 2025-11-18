import React from "react";

interface CustomerFieldsFormProps {
  formData: {
    fullName: string;
    email: string;
    phoneNumber: string;
    headSize: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
  showLabels?: boolean;
}

/**
 * Shared component for rendering customer basic information fields.
 * Used across CustomerForm, CustomerInformationForm, and OrderDetailsModal.
 * 
 * Adding a new field? Add it here and it will appear in all customer forms!
 */
const CustomerFieldsForm: React.FC<CustomerFieldsFormProps> = ({
  formData,
  onChange,
  errors = {},
  disabled = false,
  showLabels = true,
}) => {
  return (
    <div className="space-y-3">
      <div>
        {showLabels && (
          <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700 mb-1">
            Full Name {!disabled && "*"}
          </label>
        )}
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={onChange}
          disabled={disabled}
          placeholder={!showLabels ? "Full Name" : ""}
          className={`block w-full px-3 py-2 border ${
            errors.fullName ? "border-red-500" : "border-zinc-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100 disabled:cursor-not-allowed`}
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
        )}
      </div>

      <div>
        {showLabels && (
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1">
            Email {!disabled && "*"}
          </label>
        )}
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          disabled={disabled}
          placeholder={!showLabels ? "Email" : ""}
          className={`block w-full px-3 py-2 border ${
            errors.email ? "border-red-500" : "border-zinc-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100 disabled:cursor-not-allowed`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      <div>
        {showLabels && (
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-zinc-700 mb-1">
            Phone Number {!disabled && "*"}
          </label>
        )}
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={onChange}
          disabled={disabled}
          placeholder={!showLabels ? "Phone Number" : ""}
          className={`block w-full px-3 py-2 border ${
            errors.phoneNumber ? "border-red-500" : "border-zinc-300"
          } rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100 disabled:cursor-not-allowed`}
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
        )}
      </div>

      <div>
        {showLabels && (
          <label htmlFor="headSize" className="block text-sm font-medium text-zinc-700 mb-1">
            Head Size
          </label>
        )}
        <input
          id="headSize"
          name="headSize"
          type="text"
          value={formData.headSize}
          onChange={onChange}
          disabled={disabled}
          placeholder={!showLabels ? "Head Size" : ""}
          className="block w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 disabled:bg-zinc-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default CustomerFieldsForm;
