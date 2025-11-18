/**
 * Shared customer validation utilities.
 * Used across CustomerForm and other components that create/edit customers.
 */

export interface CustomerFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  headSize?: string;
}

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validates customer form data and returns validation errors.
 * Add new validation rules here to apply them across all customer forms!
 */
export const validateCustomerData = (
  formData: CustomerFormData,
  options?: {
    requireAll?: boolean;
    requireEmail?: boolean;
    requirePhone?: boolean;
  }
): ValidationErrors => {
  const errors: ValidationErrors = {};
  const { requireAll = true, requireEmail = true, requirePhone = true } = options || {};

  // Full Name validation
  if (requireAll && !formData.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  // Email validation
  if (requireEmail || (requireAll && formData.email.trim())) {
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
  }

  // Phone Number validation
  if (requirePhone || (requireAll && formData.phoneNumber.trim())) {
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    }
  }

  return errors;
};

/**
 * Checks if customer form data is complete.
 * Used to enable/disable submit buttons.
 */
export const isCustomerDataComplete = (formData: CustomerFormData): boolean => {
  return !!(
    formData.fullName?.trim() &&
    formData.email?.trim() &&
    formData.phoneNumber?.trim() &&
    formData.headSize?.trim()
  );
};

/**
 * Checks if at least basic customer info is provided.
 */
export const hasMinimumCustomerInfo = (formData: CustomerFormData): boolean => {
  return !!(
    formData.fullName?.trim() &&
    (formData.email?.trim() || formData.phoneNumber?.trim())
  );
};
