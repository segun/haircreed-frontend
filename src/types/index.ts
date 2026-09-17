export type User = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: "POS_OPERATOR" | "ADMIN" | "SUPER_ADMIN";
  requiresPasswordReset: boolean;
  createdAt: number;
  updatedAt: number;
  passwordHash?: string;
};

export type AttributeItem = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  category?: Omit<AttributeCategory, "items"> | null;
};

export type AttributeCategory = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  items: AttributeItem[];
};

export type Supplier = {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
  createdAt: number;
};

export type InventoryAudit = {
  id: string;
  inventoryItemId: string;
  action: string;
  userId?: string;
  details?: unknown;
  quantityBefore?: number;
  quantityAfter?: number;
  createdAt: number;
};

export type InventoryItem = {
  id: string;
  quantity: number;
  costPrice?: number;
  lastStockedAt: number;
  supplier: Supplier | null;
  attributes: AttributeItem[];
  audits?: InventoryAudit[];
};

export type InventoryItemWithDetails = InventoryItem;

export type AppSettings = {
    id: string;
    settings: Settings;
}

export type Settings = {
    vatRate: number;
    businessName?: string;
  businessAddress?: string;
    businessLogo?: string;
    currency?: string;
}

export type Wigger = {
  id: string;
  name: string;
  createdAt?: number;
  updatedAt?: number;
};

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type StatusHistoryItem = {
  status: string;
  timestamp: number;
  userId?: string;
};

export type CustomerAddress = {
  id: string;
  address: string;
  isPrimary: boolean;
  createdAt: number;
};

export type Customer = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  headSize?: string;
  createdAt: number;
  addresses: CustomerAddress[];
  orders?: Order[];
  receipts?: Receipt[];
};

export type CustomerSummary = Omit<Customer, "addresses" | "orders" | "receipts"> & {
  addresses?: CustomerAddress[];
};

export type Order = {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  amount: number;
  vatRate: number;
  vatAmount: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  deliveryMethod: string;
  createdAt: number;
  updatedAt: number;
  statusHistory: StatusHistoryItem[];
  notes?: string;
  customer: CustomerSummary | null;
  posOperator: Pick<User, "id" | "fullName"> | null;
  wigger?: Wigger;
  customerId?: string;
  receipt?: Receipt;
};

export type ReceiptStatus = 'DRAFT' | 'SENT';

export type ReceiptLineItem = {
  id: string;
  description: string;
  quantity: number;
  amount: number;
  discount: number;
};

export type Receipt = {
  id: string;
  receiptNumber: number;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  receiptDate: number;
  status: ReceiptStatus;
  businessName: string;
  businessAddress: string;
  currency: string;
  lineItems: ReceiptLineItem[];
  totalAmount: number;
  createdByUserId: string;
  updatedByUserId: string;
  createdAt: number;
  updatedAt: number;
  sentAt?: number;
  resentAt?: number;
  sendCount: number;
  order?: Order;
  customer?: Customer;
};

export type ReceiptDraftRequest = {
  orderId: string;
  userId: string;
};

export type SendReceiptRequest = {
  userId: string;
  receiptDate: number;
  businessName: string;
  businessAddress: string;
  customerId: string;
  recipientEmail: string;
  currency: string;
  lineItems: ReceiptLineItem[];
};

export type Page =
    | 'dashboard'
    | 'orders'
    | 'inventory'
    | 'inventory-attributes'
    | 'customers';

  export type CustomerSearchType = 'email' | 'phoneNumber' | 'headSize';

export type RecentActivity = {
  updatedAt: number;
  totalAmount: number;
  vatAmount: number;
  deliveryMethod: string;
  createdAt: number;
  posOperator: string;
  id: string;
  discountAmount: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  amount: number;
  orderStatus: string;
  discountType: string;
  orderNumber: string;
  paymentStatus: string;
  notes: string;
  customer: {
    id: string;
    headSize: string;
    createdAt: number;
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  deliveryCharge: number;
  discountValue: number;
  vatRate: number;
  statusHistory: string;
};

export type DashboardDetails = {
  totalSales: number;
  salesPercentageChange: number;
  newOrders: number;
  newOrdersChange: number;
  pendingPayments: number;
  inventoryItems: number;
  recentActivity: RecentActivity[];
};

export type Product = {
  id: string;
  name: string;
  quantity: number;
  createdAt: number;
  updatedAt: number;
  addedByUserId?: string | null;
  addedByUserFullname?: string | null;
  stockAudits?: ProductStockAudit[];
  usageAudits?: ProductUsageAudit[];
};

export type ProductStockAudit = {
  id: string;
  productId: string;
  action: string;
  quantityAdded: number;
  quantityBefore?: number | null;
  quantityAfter?: number | null;
  userId?: string | null;
  userFullname?: string | null;
  createdAt: number;
  product?: Product;
};

export type ProductUsageAudit = {
  id: string;
  productId: string;
  orderId?: string;
  action: string;
  quantityUsed: number;
  userId?: string | null;
  userFullname?: string | null;
  createdAt: number;
  product?: Product;
  order?: {
    id: string;
    orderNumber?: string;
  };
};