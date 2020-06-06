export default (referrers) => {

	return referrers.map((referrer) => ({
		url: new URL(referrer.data.id.siteReferrer),
		text: new URL(referrer.data.id.siteReferrer).href,
		count: referrer.data.count,
		date: referrer.data.created == null ? null : new Date(referrer.data.created)
	}))

}