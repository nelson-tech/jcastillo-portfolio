import type { ID } from "@directus/sdk";

type Status = {
  status: "draft" | "published";
};

type MenuItem = {
  id: ID;
  label: string;
  path: string;
} & Status;

type FooterIcon = {
  id: ID;
  brand: string;
  link: string;
} & Status;

export type Collections = {
  menu_items: MenuItem;
  footer_icons: FooterIcon;
};
