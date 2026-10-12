/** Adds loading="lazy" to every <iframe> in a third-party embed snippet that doesn't set it. */
export const lazyIframes = (html: string) => html.replace(/<iframe\b(?![^>]*\bloading=)/gi, '<iframe loading="lazy"')
