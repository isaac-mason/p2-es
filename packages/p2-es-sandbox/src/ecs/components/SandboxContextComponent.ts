import { Component } from 'arancini'
import { SandboxContext } from '../../types'

export class SandboxContextComponent extends Component {
    context!: SandboxContext

    construct(value: SandboxContext) {
        this.context = value
    }
}
