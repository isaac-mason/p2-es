import { Component } from 'arancini'
import { UpdateHandlers } from '../../../types/updateHandler'

export class UpdateHandlersComponent extends Component {
    updateHandlers!: UpdateHandlers

    construct(updateHandlers: UpdateHandlers) {
        this.updateHandlers = updateHandlers
    }
}
