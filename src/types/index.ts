import type { IInstantDatabase, InstaQLEntity } from "@instantdb/react";
import type { _schema } from "../instant";

export type DB = IInstantDatabase<typeof _schema>
export type Schema = typeof _schema;

export type User = InstaQLEntity<Schema, 'Users'>;
export type AttributeItem = InstaQLEntity<Schema, 'AttributeItem'> & {
  category?: AttributeCategory;
}
export type AttributeCategory = InstaQLEntity<Schema, 'AttributeCategory'> & {
  items: AttributeItem[];
};
export type Supplier = InstaQLEntity<Schema, 'Suppliers'> & {};
export type InventoryItem = InstaQLEntity<Schema, 'InventoryItems'> & {
  supplier: Supplier;
  attributes: AttributeItem[];
};

export type InventoryItemWithDetails = Omit<InventoryItem, 'attributes' | 'supplier'> & {
    attributes: (AttributeItem & { category: AttributeCategory })[];
    supplier: Supplier;
};

export type AppSettings = {
    id: string;
    settings: Settings;
}

export type Settings = {
    vatRate: number;
    businessName?: string;
    businessLogo?: string;
}

export type Order = InstaQLEntity<Schema, 'Orders'> & {
    customer: Customer;
    posOperator: User;
};
export type CustomerAddress = InstaQLEntity<Schema, 'CustomerAddress'>;
export type Customer = InstaQLEntity<Schema, 'Customers'> & {
    orders: Order[];
    addresses: CustomerAddress[];
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