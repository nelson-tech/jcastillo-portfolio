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
  image: API_Asset;
  content: string;
  resume: API_Asset;
};

type Contact = {
  content: string;
  email: string;
  phone: string;
};

type Collections = {
  menu_items: MenuItem;
  footer_icons: FooterIcon;
  about: About;
  contact: Contact;
  work_categories: WorkCategory;
  music_projects: MusicProjects;
  academic_projects: AcademicPublications;
  photography_projects: Photography_Projects;
  videos: API_Videos;
};
