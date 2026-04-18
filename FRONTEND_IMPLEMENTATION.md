# Products Frontend Implementation Guide

## Scope
Implement a Products section with 3 user flows:
1. Add Products
2. Use Product (linked to an order)
3. View Products

Include two audit tables:
- Product stock-add audit
- Product usage audit

## Base API
- Base path: `/api/v1/products`
- All timestamps are epoch milliseconds.

## Data Models

### Product
```ts
export interface Product {
  id: string;
  name: string;
  quantity: number;
  createdAt: number;
  updatedAt: number;
  addedByUserId?: string | null;
  addedByUserFullname?: string | null;
  stockAudits?: ProductStockAudit[];
  usageAudits?: ProductUsageAudit[];
}
```

### ProductStockAudit
```ts
export interface ProductStockAudit {
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
}
```

### ProductUsageAudit
```ts
export interface ProductUsageAudit {
  id: string;
  productId: string;
  orderId: string;
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
}
```

## Endpoints

### 1) Add Product
- `POST /api/v1/products`

Request:
```json
{
  "name": "Shampoo",
  "quantity": 20,
  "userId": "<logged-in-user-id>",
  "origin": "WEB"
}
```

Rules:
- `quantity` must be >= 0.
- Creates product with cumulative quantity = initial quantity.
- Also creates a stock-audit entry.

### 2) Add Stock to Existing Product
- `POST /api/v1/products/:id/add-stock`

Request:
```json
{
  "quantity": 5,
  "userId": "<logged-in-user-id>",
  "origin": "WEB"
}
```

Rules:
- `quantity` must be >= 1.
- New quantity = current quantity + added quantity.
- Creates stock-audit entry.

### 3) Use Product (Linked to Order)
- `POST /api/v1/products/use`

Request:
```json
{
  "productId": "<product-id>",
  "orderId": "<order-id>",
  "quantity": 2,
  "userId": "<logged-in-user-id>",
  "origin": "WEB"
}
```

Rules:
- Validates product exists.
- Validates order exists.
- `quantity` must be >= 1.
- Fails if quantity requested exceeds available quantity.
- Deducts immediately from product quantity.
- Creates usage-audit entry.

### 4) View Products List
- `GET /api/v1/products`

Use this for the main products table.

### 5) View Single Product
- `GET /api/v1/products/:id`

Optional detail page/drawer endpoint.

### 6) Stock Audit Table
- `GET /api/v1/products/audits/stock`
- `GET /api/v1/products/audits/stock?productId=<id>`

Use without filter for global history, with `productId` for product detail context.

### 7) Usage Audit Table
- `GET /api/v1/products/audits/usage`
- `GET /api/v1/products/audits/usage?productId=<id>`
- `GET /api/v1/products/audits/usage?orderId=<id>`
- `GET /api/v1/products/audits/usage?productId=<id>&orderId=<id>`

### 8) Update Product Name
- `PATCH /api/v1/products/:id`

Request:
```json
{
  "name": "Shampoo XL",
  "userId": "<logged-in-user-id>",
  "origin": "WEB"
}
```

### 9) Delete Product
- `DELETE /api/v1/products/:id`

Rules:
- Returns `204 No Content` on success.
- Delete is blocked if product quantity is greater than 0.

## UI Screens and Components

### A) Products List Screen
Columns:
- ID (`id`)
- Name (`name`)
- Quantity (`quantity`)
- Date Added (`createdAt`)
- Added By (`addedByUserFullname` fallback to `addedByUserId`)

Actions:
- Add Product
- Add Stock
- Use Product
- View Audits
- Rename
- Delete (only when quantity = 0)

### B) Add Product Modal
Fields:
- Name (required)
- Quantity (required, number >= 0)

Submission body:
- Include `userId` from authenticated user context.
- Include `origin: "WEB"`.

### C) Use Product Modal
Fields:
- Product selector (required)
- Order selector/input (required)
- Quantity (required, number >= 1)

Submission body:
- `productId`, `orderId`, `quantity`, `userId`, `origin`.

### D) Audit View (Tabs)
Tab 1: Stock Added
- Product
- When Added (`createdAt`)
- Quantity Added (`quantityAdded`)
- Added By (`userFullname` fallback `userId`)

Tab 2: Product Used
- Product
- Order (`orderId` or `order.orderNumber` when present)
- Amount Used (`quantityUsed`)
- Used By (`userFullname` fallback `userId`)
- Used At (`createdAt`)

## Recommended Frontend API Layer

```ts
export const productsApi = {
  list: () => http.get<Product[]>('/api/v1/products'),
  get: (id: string) => http.get<Product>(`/api/v1/products/${id}`),
  create: (payload: { name: string; quantity: number; userId: string; origin?: string }) =>
    http.post<Product>('/api/v1/products', payload),
  addStock: (id: string, payload: { quantity: number; userId: string; origin?: string }) =>
    http.post<Product>(`/api/v1/products/${id}/add-stock`, payload),
  useProduct: (payload: { productId: string; orderId: string; quantity: number; userId: string; origin?: string }) =>
    http.post<Product>('/api/v1/products/use', payload),
  update: (id: string, payload: { name?: string; userId: string; origin?: string }) =>
    http.patch<Product>(`/api/v1/products/${id}`, payload),
  remove: (id: string) => http.delete<void>(`/api/v1/products/${id}`),
  stockAudits: (params?: { productId?: string }) =>
    http.get<ProductStockAudit[]>('/api/v1/products/audits/stock', { params }),
  usageAudits: (params?: { productId?: string; orderId?: string }) =>
    http.get<ProductUsageAudit[]>('/api/v1/products/audits/usage', { params }),
};
```

## Error Handling
Handle these backend errors in UI:
- 404: Product not found / Order not found.
- 400: Not enough quantity available.
- 400: Cannot delete product with remaining quantity.

Recommended user messages:
- "Product not found. Refresh and try again."
- "Order not found. Check order ID."
- "Insufficient stock for this product."
- "This product cannot be deleted until quantity is zero."

## Frontend Acceptance Checklist
- Products list shows ID, Name, Quantity, Date Added, Added By.
- Add Product updates list and appears in stock audit.
- Add Stock increases quantity and adds stock-audit row.
- Use Product validates input and deducts quantity immediately.
- Usage audit row appears with Product, Order, Amount Used.
- Delete button disabled/hidden when quantity > 0.
- All timestamps formatted to local date/time in UI.
