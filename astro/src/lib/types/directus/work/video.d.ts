type API_Video_Provider = {
	name: MaybeString
	value: MaybeString
}

type API_Video_Link = {
	video_links_id: {
		label: MaybeString
		videoId: MaybeString
		provider: API_Video_Provider
	} & API_Status
}

type API_Videos = API_Singleton & {
	vr_header: MaybeString
	vr: API_Video_Link[]
	editing_header: MaybeString
	editing: API_Video_Link[]
	commercial_header: MaybeString
	commercial: API_Video_Link[]
}
