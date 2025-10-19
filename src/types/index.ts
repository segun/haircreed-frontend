import type { IInstantDatabase, InstaQLEntity } from "@instantdb/react";
import type { _schema } from "../instant";

export type DB = IInstantDatabase<typeof _schema>
export type Schema = typeof _schema;

export type User = InstaQLEntity<Schema, 'Users'>;
export type AttributeItem = InstaQLEntity<Schema, 'AttributeItem'>
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
}

export type Page =
    | 'dashboard'
    | 'orders'
    | 'inventory'
    | 'inventory-attributes'
    | 'customers';