type AP_Podcasts = {
	label: string
	html: string
}

type AP_Publication = {
	text: string
	label: string
	link: string
	image: string
}

type AcademicPublications = PageInfo & {
	academic_publications_header: string
	academic_publications: AP_Publication[]
	podcasts_header: string
	podcasts: AP_Podcasts[]
}
