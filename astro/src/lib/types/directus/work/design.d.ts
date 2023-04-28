type API_Design_Projects = API_Singleton & {
	motion_graphics_header: MaybeString
	motion_graphics_description: MaybeString
	motion_graphics_videos: API_Video_Link[]
	graphic_design_header: MaybeString
	graphic_design_description: MaybeString
	graphic_design_images: API_Image[]
}
