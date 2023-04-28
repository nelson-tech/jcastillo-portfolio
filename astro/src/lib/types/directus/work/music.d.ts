type API_Music_Hero = {
	image: API_Asset | null | undefined
	link: string | null | undefined
}

type API_Spotify_Link = {
	artist_name: string | null | undefined
	artist_id: string | null | undefined
}

type API_Music_Press_Link = {
	label: string | null | undefined
	url: string | null | undefined
}

type API_Music_Review = {
	text: string | null | undefined
	links: API_Music_Press_Link[] | null | undefined
}

type API_Music_Projects = API_Singleton & {
	spotify: API_Spotify_Link[] | null | undefined
} & API_Music_Review &
	API_Music_Hero
