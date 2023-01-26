import { Component } from 'arancini'
import { Constraint } from 'p2-es'

export class PhysicsConstraintComponent extends Component {
    constraint!: Constraint

    construct(spring: Constraint) {
        this.constraint = spring
    }
}
