import produce from 'immer'

import {
	SET_SYSTEMS_ERROR,
	SET_SYSTEMS_FETCHING,
	SET_SYSTEMS_SORTING,
	SET_SYSTEMS_VALUE,
	SET_SYSTEMS_TYPE
} from '../actions'

import { SYSTEMS_SORTING_TOP, SYSTEMS_TYPE_NO_VERSION } from '../../../constants/systems'

export const initialState = () => ({
	type: SYSTEMS_TYPE_NO_VERSION,
	sorting: SYSTEMS_SORTING_TOP,
	value: {}
})

export const initialSubState = () => ({
	value: [],
	fetching: false,
	error: undefined
})

export default produce((draft, action) => {

	const hasDomainId = () => action.domainId != null
	const hasDomainValue = () => draft.value[action.domainId] != null

	if (hasDomainId() === true && hasDomainValue() === false) draft.value[action.domainId] = initialSubState()

	switch (action.type) {
		case SET_SYSTEMS_TYPE:
			// Reset value because the view shouldn't show the old data when switching
			draft.value = initialState().value
			draft.type = action.payload
			break
		case SET_SYSTEMS_SORTING:
			// Reset value because the view shouldn't show the old data when switching
			draft.value = initialState().value
			draft.sorting = action.payload
			break
		case SET_SYSTEMS_VALUE:
			draft.value[action.domainId].value = action.payload || initialSubState().value
			break
		case SET_SYSTEMS_FETCHING:
			draft.value[action.domainId].fetching = action.payload || initialSubState().fetching
			break
		case SET_SYSTEMS_ERROR:
			draft.value[action.domainId].error = action.payload || initialSubState().error
			break
	}

}, initialState())