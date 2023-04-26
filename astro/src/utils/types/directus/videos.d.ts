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
  vr: API_Video[];
  editing: API_Video[];
  commercial: API_Video[];
};
