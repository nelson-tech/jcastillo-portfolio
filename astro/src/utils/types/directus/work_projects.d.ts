type Hero = {
  image: string;
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
  spotify: Spotify[];
} & Reviews &
  Hero;
