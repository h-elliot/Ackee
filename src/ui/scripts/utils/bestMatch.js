import isDefined from '../../../utils/isDefined'

// TODO: Remove this file from FE scripts

export default (matches) => {

	// Find the first item that only consists if defined values
	return matches.reduce((prev, [ key, values ]) => {
		return values.every(isDefined) === true && prev == null ? key : prev
	}, undefined)

}