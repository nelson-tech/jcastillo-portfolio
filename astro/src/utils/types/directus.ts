import type { ID } from "@directus/sdk";

type MenuItem = {
  id: ID;
  label: string;
  path: string;
};

export type Collections = {
  menu_items: MenuItem;
};
