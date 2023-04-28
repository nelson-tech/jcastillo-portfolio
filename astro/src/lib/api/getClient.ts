import { Directus } from "@directus/sdk"

const getAPIClient = async () => {
	const directusURL = import.meta.env.PUBLIC_DIRECTUS_URL

	const directus = new Directus<Collections>(directusURL)

	return directus
}

export default getAPIClient
