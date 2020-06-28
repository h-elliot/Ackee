import api from '../utils/api'
import signalHandler from '../utils/signalHandler'

export const SET_SIZES_TYPE = Symbol()
export const SET_SIZES_VALUE = Symbol()
export const SET_SIZES_FETCHING = Symbol()
export const SET_SIZES_ERROR = Symbol()

export const setSizesType = (payload) => ({
	type: SET_SIZES_TYPE,
	payload
})

export const setSizesValue = (domainId, payload) => ({
	type: SET_SIZES_VALUE,
	domainId,
	payload
})

export const setSizesFetching = (domainId, payload) => ({
	type: SET_SIZES_FETCHING,
	domainId,
	payload
})

export const setSizesError = (domainId, payload) => ({
	type: SET_SIZES_ERROR,
	domainId,
	payload
})

export const fetchSizes = signalHandler((signal) => (props, domainId) => async (dispatch) => {

	dispatch(setSizesFetching(domainId, true))
	dispatch(setSizesError(domainId))

	try {

		const data = await api({
			query: `
				query fetchSizes($id: ID!, $sorting: Sorting!, $type: SystemType!, $range: Range) {
					domain(id: $id) {
						statistics {
							sizes(sorting: $sorting, type: $type, range: $range) {
								id
								count
								created
							}
						}
					}
				}
			`,
			variables: {
				id: domainId,
				sorting: props.sizes.sorting,
				type: props.sizes.type,
				range: props.filter.range
			},
			props,
			signal: signal(domainId)
		})

		dispatch(setSizesValue(domainId, data.domain.statistics.sizes))
		dispatch(setSizesFetching(domainId, false))

	} catch (err) {

		if (err.name === 'AbortError') return
		dispatch(setSizesFetching(domainId, false))
		if (err.name === 'HandledError') return
		dispatch(setSizesError(domainId, err))

	}

})