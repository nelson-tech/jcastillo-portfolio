type API_Audio_Projects = API_Singleton & {
	sound_design_header?: string
	sound_design_description?: string
	sound_design_video_links?: API_Video_Link
	audio_engineering_header?: string
	audio_engineering_description?: string
	audio_engineering_html?: {
		label?: string
		html?: string
	}
}
