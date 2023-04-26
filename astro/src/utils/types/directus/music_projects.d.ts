type Hero = {
  image: API_Asset;
  link: string;
};

type Spotify = {
  artist_name: string;
  artist_id: string;
};

type PressReview = {
  label: string;
  url: string;
};

type Reviews = {
  text: string;
  links: PressReview[];
};

type MusicProjects = {
  id: ID;
  page_title: string;
  page_header: string;
  page_description: string;
  spotify: Spotify[];
} & Reviews &
  Hero;
