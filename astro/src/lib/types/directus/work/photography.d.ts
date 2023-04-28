type API_Image = { directus_files_id?: API_Asset }

type API_Photography_Projects = API_Singleton & {
	images?: API_Image[]
}
