type Photography_Projects = {
  id: ID;
  page_title: string;
  page_header: string;
  page_description: string;
  images: { directus_files_id: API_Asset }[];
};
