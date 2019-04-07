import { createElement as h } from 'react'

import isUnknownError from '../utils/isUnknownError'

import OverlayFailure from './overlays/OverlayFailure'
import OverlayLogin from './overlays/OverlayLogin'
import Dashboard from './Dashboard'

const Component = (props) => {

	// Only handle errors not handled by other components
	const unknownErrors = props.errors.filter(isUnknownError)

	const hasError = unknownErrors.length !== 0
	const hasToken = props.token.value.id != null

	const showOverlayFailure = hasError === true
	const showOverlayLogin = hasError === false && hasToken === false
	const showDashboard = hasError === false && hasToken === true

	if (showOverlayFailure === true) return h(OverlayFailure, { errors: unknownErrors })
	if (showOverlayLogin === true) return h(OverlayLogin, props)
	if (showDashboard === true) return h(Dashboard, props)

}

Component.displayName = 'Main'

export default Component