import { i, init } from '@instantdb/react';

export const _schema = i.schema({
  entities: {
    Users: i.entity({
      id: i.string().unique(),
      fullName: i.string(),
      username: i.string().unique(),
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
  },
  links: {
    AttributeCategoryItem: {
      forward: { on: 'AttributeItem', has: 'one', label: 'category' },
      reverse: { on: 'AttributeCategory', has: 'many', label: 'items' },
    },
  },
});


const db = init({
  appId: "9356182e-9457-427f-818c-3c35184a669f",
  schema: _schema,
});

export default db;