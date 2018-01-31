import * as m from 'mithril'

export default {
	view(vnode) {
		return m('div',
			m('a', { href: '/home', oncreate: m.route.link }, "Home"),
			m('span', " | "),
			m('a', { href: '/about', oncreate: m.route.link }, "About"),
			m('span', " | "),
			m('a', { href: '/tetris', oncreate: m.route.link }, "Tetris")
		)
	}
} as m.Component<{}, {}>