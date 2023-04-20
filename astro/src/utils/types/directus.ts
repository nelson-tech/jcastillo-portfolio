import type { ID } from "@directus/sdk";

type Status = {
  status: string;
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

type About = {
  id: ID;
  image: string;
  content: string;
  resume: string;
};

type Contact = {
  id: ID;
  content: string;
  email: string;
  phone: string;
};

export type Collections = {
  menu_items: MenuItem;
  footer_icons: FooterIcon;
  about: About;
  contact: Contact;
};
