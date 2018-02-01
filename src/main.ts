// App entry point
import * as m from 'mithril'
import home from './home'
import about from './about'
import tetris from './tetris'

m.route(document.body, '/', { '/': tetris })