type API_Video_Provider = {
  name?: string;
  value: string;
};

type API_Video = {
  video_links_id: {
    label?: string;
    link: string;
    provider: API_Video_Provider;
  } & Status;
};

type API_Videos = {
  id: ID;
  page_title: string;
  page_header: string;
  page_description: string;
  vr_header: string;
  vr: API_Video[];
  editing_header: string;
  editing: API_Video[];
  commercial_header: string;
  commercial: API_Video[];
};
