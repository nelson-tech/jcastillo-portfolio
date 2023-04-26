type AP_Podcasts = {
  label: string;
  html: string;
};

type AP_Publication = {
  text: string;
  label: string;
  link: string;
  image: string;
};

type AcademicPublications = {
  academic_publications: AP_Publication[];
  podcasts: AP_Podcasts[];
};
