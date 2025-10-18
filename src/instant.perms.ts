// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  attrs: {
    allow: {
      view: "auth.id != null",
      create: "false",
      update: "false",
      delete: "false",
    },
  },
  Users: {
    allow: {
      view: "true",
    }
  }
} satisfies InstantRules;

export default rules;
