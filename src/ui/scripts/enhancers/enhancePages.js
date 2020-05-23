export default (pages) => {

	// Extract and enhance the data from the API
	return pages.map((page) => ({
		url: new URL(page.data.id.siteLocation),
		text: new URL(page.data.id.siteLocation).href,
		count: page.data.count,
		date: page.data.created == null ? null : new Date(page.data.created)
	}))

}