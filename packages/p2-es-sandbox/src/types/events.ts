import type { InteractionState } from './interactionState'

export type SandboxKeyDownEvent = KeyboardEvent

export type SandboxKeyUpEvent = KeyboardEvent

export type SandboxDrawPointsChangeEvent = {
    type: 'drawPointsChange'
}

export type SandboxDrawRectangleChangeEvent = {
    type: 'drawRectangleChange'
}

export type SandboxDrawCircleChangeEvent = {
    type: 'drawCircleChange'
}

export type SandboxStateChangeEvent = {
    type: 'stateChange'
    state: InteractionState
}

export type SandboxEventMap = {
    keydown: SandboxKeyDownEvent
    keyup: SandboxKeyUpEvent
    drawPointsChange: SandboxDrawPointsChangeEvent
    drawRectangleChange: SandboxDrawRectangleChangeEvent
    drawCircleChange: SandboxDrawCircleChangeEvent
    stateChange: SandboxStateChangeEvent
}
