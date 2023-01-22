import { Component } from 'arancini'
import { World } from 'p2-es'

export class PhysicsWorldComponent extends Component {
    physicsWorld!: World

    construct(physicsWorld: World) {
        this.physicsWorld = physicsWorld
    }
}
