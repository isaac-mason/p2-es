import { Component } from 'arancini'

export class MouseComponent extends Component {
    stagePosition: { x: number; y: number } = { x: 0, y: 0 }

    physicsPosition: { x: number; y: number } = { x: 0, y: 0 }

    onUpHandlers!: Set<() => void>

    onDownHandlers!: Set<() => void>

    onMoveHandlers!: Set<() => void>

    construct() {
        this.stagePosition.x = 0
        this.stagePosition.y = 0

        this.physicsPosition.x = 0
        this.physicsPosition.y = 0

        this.onUpHandlers = new Set()
        this.onDownHandlers = new Set()
        this.onMoveHandlers = new Set()
    }
}
