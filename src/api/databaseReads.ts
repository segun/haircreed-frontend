import type {
  AppSettings,
  AttributeCategory,
  Customer,
  InventoryAudit,
  InventoryItem,
  Order,
  OrderItem,
  Receipt,
  Supplier,
  User,
} from "../types";
import { authorizedGet, type DataResponse, type PaginatedResponse } from "./client";

type Query = Record<string, unknown>;

export type OrderOption = Pick<Order, "id" | "orderNumber" | "createdAt"> & {
  customer: { id: string; fullName: string } | null;
  wigger?: { id: string; name: string };
};

export type ReceiptDetail = Receipt & {
  customer: Customer;
  order: Order;
};

export type DetailedSale = {
  orderId: string;
  orderNumber: string;
  createdAt: number;
  customerName: string;
  posOperatorName: string;
  items: OrderItem[];
  amount: number;
  vatAmount: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentStatus: string;
};

export type DetailedSalesResponse = PaginatedResponse<DetailedSale> & {
  summary: {
    orderCount: number;
    grossAmount: number;
    vatAmount: number;
    discountAmount: number;
    deliveryCharge: number;
    totalAmount: number;
  };
};

export type SalesByItem = {
  itemId: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type OutstandingPayment = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  amountPaid: number;
  createdAt: number;
};

export type StaffPerformance = {
  userId: string;
  fullName: string;
  role: User["role"];
  totalOrders: number;
  totalSales: number;
  averageOrderValue: number;
};

export type OrderFulfillment = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  createdAt: number;
  updatedAt: number;
  orderStatus: string;
  deliveryMethod: string;
};

export type WiggerPerformance = {
  wiggerId: string;
  name: string;
  orderCount: number;
  percentage: number;
};

export type DashboardResponse = {
  summary: {
    totalSales: number;
    salesPercentageChange: number;
    newOrders: number;
    newOrdersChange: number;
    pendingPayments: number;
    inventoryItems: number;
  };
  recentActivity: Array<{
    id: string;
    orderNumber: string;
    orderStatus: string;
    createdAt: number;
    totalAmount: number;
    customer: { id: string; fullName: string } | null;
  }>;
  charts: {
    salesOverTime: Array<{ bucketStart: number; sales: number }>;
    paymentStatus: Array<{ name: string; value: number }>;
    discountVsFullPrice: Array<{ bucketStart: number; discounted: number; fullPrice: number }>;
    orderStatus: Array<{ name: string; value: number }>;
    salesByPosOperator: Array<{ userId: string; name: string; sales: number }>;
    deliveryMethod: Array<{ name: string; value: number; percentage: number }>;
  };
};

export const getCurrentAppSettings = async (signal?: AbortSignal) =>
  (await authorizedGet<DataResponse<AppSettings>>("/api/v1/app-settings/current", undefined, signal)).data;

export const getInventory = (query: Query = {}, signal?: AbortSignal) =>
  authorizedGet<PaginatedResponse<InventoryItem>>("/api/v1/inventory", query, signal);

export const getInventoryAudits = (inventoryItemId: string, signal?: AbortSignal) =>
  authorizedGet<PaginatedResponse<InventoryAudit>>(
    `/api/v1/inventory/${encodeURIComponent(inventoryItemId)}/audits`,
    { pageSize: 100, sort: "createdAt:desc" },
    signal,
  );

export const getSuppliers = (query: Query = {}, signal?: AbortSignal) =>
  authorizedGet<PaginatedResponse<Supplier>>("/api/v1/suppliers", query, signal);

export const getAttributeCategories = (signal?: AbortSignal) =>
  authorizedGet<DataResponse<AttributeCategory[]>>(
    "/api/v1/inventory-attributes/categories",
    { includeItems: true },
    signal,
  );

export const getCustomers = (query: Query = {}, signal?: AbortSignal) =>
  authorizedGet<PaginatedResponse<Customer>>("/api/v1/customers", query, signal);

export const getCustomerOptions = (query: Query = {}, signal?: AbortSignal) =>
  authorizedGet<PaginatedResponse<Customer>>("/api/v1/customers/options", query, signal);

export const lookupCustomer = async (
  type: "email" | "phoneNumber" | "headSize",
  value: string,
  signal?: AbortSignal,
) => (await authorizedGet<DataResponse<Customer | null>>(
  "/api/v1/customers/lookup",
  { type, value },
  signal,
)).data;

export const getUsers = (view: "management" | "options", signal?: AbortSignal) =>
  authorizedGet<PaginatedResponse<User>>("/api/v1/users", { view, pageSize: 100 }, signal);

export const getOrders = (query: Query = {}, signal?: AbortSignal) =>
  authorizedGet<PaginatedResponse<Order>>("/api/v1/orders", query, signal);

export const getOrderOptions = (query: Query = {}, signal?: AbortSignal) =>
  authorizedGet<PaginatedResponse<OrderOption>>("/api/v1/orders/options", query, signal);

export const getOrder = async (orderId: string, signal?: AbortSignal) =>
  (await authorizedGet<DataResponse<Order>>(
    `/api/v1/orders/${encodeURIComponent(orderId)}`,
    undefined,
    signal,
  )).data;

export const getReceipts = (query: Query = {}, signal?: AbortSignal) =>
  authorizedGet<PaginatedResponse<Receipt>>("/api/v1/receipts", query, signal);

export const getReceipt = async (receiptId: string, signal?: AbortSignal) =>
  (await authorizedGet<DataResponse<ReceiptDetail>>(
    `/api/v1/receipts/${encodeURIComponent(receiptId)}`,
    undefined,
    signal,
  )).data;

export const getDetailedSales = (query: Query = {}, signal?: AbortSignal) =>
  authorizedGet<DetailedSalesResponse>("/api/v1/reports/sales/detailed", query, signal);

export const getSalesByItem = async (query: Query = {}, signal?: AbortSignal) =>
  (await authorizedGet<DataResponse<SalesByItem[]>>(
    "/api/v1/reports/sales/by-item",
    query,
    signal,
  )).data;

export const getOutstandingPayments = async (signal?: AbortSignal) =>
  (await authorizedGet<DataResponse<OutstandingPayment[]>>(
    "/api/v1/reports/outstanding-payments",
    undefined,
    signal,
  )).data;

export const getCurrentStock = async (signal?: AbortSignal) =>
  (await authorizedGet<DataResponse<InventoryItem[]>>(
    "/api/v1/reports/inventory/current-stock",
    undefined,
    signal,
  )).data;

export const getLowStock = async (threshold = 10, signal?: AbortSignal) =>
  (await authorizedGet<DataResponse<InventoryItem[]>>(
    "/api/v1/reports/inventory/low-stock",
    { threshold },
    signal,
  )).data;

export const getStaffPerformance = async (query: Query = {}, signal?: AbortSignal) =>
  (await authorizedGet<DataResponse<StaffPerformance[]>>(
    "/api/v1/reports/staff-performance",
    query,
    signal,
  )).data;

export const getOrderFulfillment = async (statuses: string[], signal?: AbortSignal) =>
  (await authorizedGet<DataResponse<OrderFulfillment[]>>(
    "/api/v1/reports/order-fulfillment",
    { status: statuses },
    signal,
  )).data;

export const getWiggerPerformance = (query: Query = {}, signal?: AbortSignal) =>
  authorizedGet<DataResponse<WiggerPerformance[]> & {
    summary: { totalOrders: number; totalWiggers: number };
  }>("/api/v1/reports/wiggers", query, signal);

export const getDashboard = async (query: Query = {}, signal?: AbortSignal) =>
  (await authorizedGet<DataResponse<DashboardResponse>>(
    "/api/v1/dashboard",
    query,
    signal,
  )).data;