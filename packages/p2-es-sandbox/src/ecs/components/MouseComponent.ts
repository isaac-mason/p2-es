import { Component } from 'arancini'

export class MouseComponent extends Component {
    pos: { x: number; y: number } = { x: 0, y: 0 }

    construct() {
        this.pos.x = 0
        this.pos.y = 0
    }
}
