import { createElement as h } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const Component = (props) => (

	h(props.type, {
		onClick: props.onClick,
		href: props.href,
		className: classNames({
			'linkItem': true,
			'linkItem--disabled': props.disabled === true,
			'link': true
		})
	},
		h('span', {}, props.children),
		props.text != null && h('span', {}, props.text)
	)

)

Component.displayName = 'LinkItem'

Component.propTypes = {
	type: PropTypes.oneOf([ 'p', 'a', 'button' ]).isRequired,
	href: PropTypes.string,
	onClick: PropTypes.func,
	disabled: PropTypes.bool,
	text: PropTypes.string,
	children: PropTypes.node.isRequired
}

export default Component