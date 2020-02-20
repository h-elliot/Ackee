'use strict'

const { subDays } = require('date-fns')

module.exports = (id, property) => [
	{
		$match: {
			domainId: id,
			[property]: {
				$ne: null
			},
			created: {
				$gte: subDays(new Date(), 6)
			}
		}
	},
	{
		$sort: {
			created: -1
		}
	},
	{
		$project: {
			_id: `$${ property }`,
			created: '$created'
		}
	},
	{
		$limit: 25
	}
]