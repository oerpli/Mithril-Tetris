import * as m from 'mithril'
import nav from './nav'

import * as tetris from './models/Tetris'



export default {
    view(vnode) {
        return m('.page', [
            // m(nav),
            m('h1', ["Points: ",tetris.Game.Points]),
            // m('p', "There should be a tetris game here:"),
            m(tetris.Game),
        ])
    }
} as m.Component<{}, {}>