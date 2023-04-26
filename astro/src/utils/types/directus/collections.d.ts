type Status = {
  status: string;
};

type MenuItem = {
  label: string;
  path: string;
} & Status;

type FooterIcon = {
  brand: string;
  link: string;
} & Status;

type About = {
  image: string;
  content: string;
  resume: string;
};

type Contact = {
  content: string;
  email: string;
  phone: string;
};

type WorkCategory = {
  name: string;
  slug: string;
  image: string;
} & Status;

type Collections = {
  menu_items: MenuItem;
  footer_icons: FooterIcon;
  about: About;
  contact: Contact;
  work_categories: WorkCategory;
  music_projects: MusicProjects;
  academic_projects: AcademicPublications;
  photographs: API_Photograph;
  videos: API_Videos;
};
