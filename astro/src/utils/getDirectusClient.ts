import { Directus } from "@directus/sdk";
import type { Collections } from "./types/directus";

export const getDirectusClient = async () => {
  const directusURL = import.meta.env.PUBLIC_DIRECTUS_URL;

  const directus = new Directus<Collections>(directusURL);

  return directus;
};
