import React from "react";
import type { Customer, CustomerSearchType } from "../../types";
import { Search } from "lucide-react";
import Tooltip from "./Tooltip";

interface CustomerSearchWidgetProps {
  searchType: CustomerSearchType;
  searchQuery: string;
  onSearchTypeChange: (type: CustomerSearchType) => void;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => Promise<Partial<Customer> | null>;
  isSearching?: boolean;
  disabled?: boolean;
  variant?: "inline" | "block";
}

/**
 * Shared component for searching customers by email or phone number.
 * Used in CustomerInformationForm and OrderDetailsModal.
 * 
 * Supports two variants:
 * - "inline": Integrated into input field (CustomerInformationForm style)
 * - "block": Separate search widget (OrderDetailsModal style)
 */
const CustomerSearchWidget: React.FC<CustomerSearchWidgetProps> = ({
  searchType,
  searchQuery,
  onSearchTypeChange,
  onSearchQueryChange,
  onSearch,
  isSearching = false,
  disabled = false,
  variant = "block",
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !disabled && !isSearching) {
      e.preventDefault();
      onSearch();
    }
  };

  if (variant === "inline") {
    // Inline variant: used in CustomerInformationForm with edit/search button
    return (
      <div className="flex rounded-md shadow-sm">
        <input
          type={searchType === "email" ? "email" : "tel"}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="flex-1 block w-full rounded-none rounded-l-md pl-3 pr-10 py-2 text-base border border-zinc-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-zinc-100 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={onSearch}
          disabled={disabled || isSearching}
          className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-zinc-300 bg-zinc-50 text-zinc-500 sm:text-sm hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Tooltip content={`Search by ${searchType}`}>
            <Search size={16} />
          </Tooltip>
        </button>
      </div>
    );
  }

  // Block variant: used in OrderDetailsModal as separate search section
  return (
    <div className="p-3 bg-zinc-50 rounded-md">
      <label className="block text-sm font-medium text-zinc-700 mb-2">
        Search Customer
      </label>
      <div className="flex space-x-2">
        <select
          value={searchType}
          onChange={(e) => onSearchTypeChange(e.target.value as CustomerSearchType)}
          disabled={disabled}
          className="px-2 py-1 border border-zinc-300 rounded-md text-sm disabled:bg-zinc-100 disabled:cursor-not-allowed"
        >
          <option value="email">Email</option>
          <option value="phoneNumber">Phone</option>
        </select>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Search by ${searchType}...`}
          disabled={disabled}
          className="flex-1 px-3 py-1 border border-zinc-300 rounded-md text-sm disabled:bg-zinc-100 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={onSearch}
          disabled={disabled || isSearching || !searchQuery.trim()}
          className="px-3 py-1 bg-zinc-600 text-white rounded-md hover:bg-zinc-700 disabled:bg-zinc-400 disabled:cursor-not-allowed text-sm"
        >
          {isSearching ? (
            <span>...</span>
          ) : (
            <Search size={16} />
          )}
        </button>
      </div>
    </div>
  );
};

export default CustomerSearchWidget;
