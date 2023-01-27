import { Component } from 'arancini'

type UpdateHandler = (delta: number) => void

export class UpdateHandlerComponent extends Component {
    fn!: UpdateHandler

    priority!: number

    construct(fn: UpdateHandler, priority: number) {
        this.fn = fn
        this.priority = priority
    }
}
