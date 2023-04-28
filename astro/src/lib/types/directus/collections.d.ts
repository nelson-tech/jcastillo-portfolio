type API_Menu_Item = {
	label: MaybeString
	path: MaybeString
} & API_Status

type API_Footer_Icon = {
	brand: MaybeString
	link: MaybeString
} & API_Status

type About = {
	image: API_Asset
	content: MaybeString
	resume: API_Asset
}

type Contact = {
	content: MaybeString
	email: MaybeString
	phone: MaybeString
}

type Collections = {
	menu_items: API_Menu_Item
	footer_icons: API_Footer_Icon
	about: About
	contact: Contact
	work_categories: API_Work_Category
	music_projects: API_Music_Projects
	academic_projects: AcademicPublications
	audio_projects: API_Audio_Projects
	videos: API_Videos
	photography_projects: API_Photography_Projects
	design_projects: API_Design_Projects
}
