import { Directus } from "@directus/sdk";

export const getDirectusClient = async () => {
  const directusURL = import.meta.env.PUBLIC_DIRECTUS_URL;

  const directus = new Directus<Collections>(directusURL);

  return directus;
};
