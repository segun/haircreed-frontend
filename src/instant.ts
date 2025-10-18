import { i, init } from '@instantdb/react';

export const _schema = i.schema({
  entities: {
    Users: i.entity({
      id: i.string().unique(),
      fullName: i.string(),
      username: i.string().unique(),
      email: i.string().unique(),
      passwordHash: i.string(),
      role: i.string(),
      requiresPasswordReset: i.boolean(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    AttributeCategory: i.entity({
      id: i.string().unique(),
      title: i.string().unique(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    AttributeItem: i.entity({
      id: i.string().unique(),
      name: i.string(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    Orders: i.entity({
      id: i.string().unique(),
      orderNumber: i.string(),
      items: i.json(),
      amount: i.number(),
      vatRate: i.number(),
      vatAmount: i.number(),
      discountType: i.string(),
      discountValue: i.number(),
      discountAmount: i.number(),
      deliveryCharge: i.number(),
      totalAmount: i.number(),
      orderStatus: i.string(),
      paymentStatus: i.string(),
      deliveryMethod: i.string(),
      createdAt: i.number(),
      statusHistory: i.json(),
    }),
    Customers: i.entity({
      id: i.string().unique(),
      fullName: i.string(),
      email: i.string().unique(),
      phoneNumber: i.string().unique(),
      headSize: i.string().optional(),
      addresses: i.json().optional(),
      createdAt: i.number(),
    }),    
    Suppliers: i.entity({
      id: i.string().unique(),
      name: i.string(),
      contactPerson: i.string().optional(),
      email: i.string().optional(),
      phoneNumber: i.string().optional(),
      address: i.string().optional(),
      notes: i.string().optional(),
      createdAt: i.number(),
    }),
    InventoryItems: i.entity({
      id: i.string().unique(),
      quantity: i.number(),
      costPrice: i.number().optional(),
      lastStockedAt: i.number(),
    }),
  },
  links: {
    AttributeCategoryItem: {
      forward: { on: 'AttributeItem', has: 'one', label: 'category' },
      reverse: { on: 'AttributeCategory', has: 'many', label: 'items' },
    },
    InventoryItemSupplier: {
      forward: { on: 'InventoryItems', has: 'one', label: 'supplier' },
      reverse: { on: 'Suppliers', has: 'many', label: 'inventoryItems' },
    },
    InventoryItemAttributes: {
      forward: { on: 'InventoryItems', has: 'many', label: 'attributes' },
      reverse: { on: 'AttributeItem', has: 'many', label: 'inventoryItems' },
    },
  },
});


const db = init({
  appId: "9356182e-9457-427f-818c-3c35184a669f",
  schema: _schema,
});

export default db;