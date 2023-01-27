import * as p2 from 'p2-es'
import { Pixi } from '../ecs/components/singletons/PixiComponent'
import { SandboxContext, SandboxEventMap, SandboxFunction } from '../types'

export type SandboxFunctionEvaluatorProps = {
    pixi: Pixi
    sandboxFunction: SandboxFunction
}

export const sandboxFunctionEvaluator = ({
    pixi,
    sandboxFunction,
}: SandboxFunctionEvaluatorProps) => {
    const { renderer, container } = pixi

    const sandboxUpdateHandlers = new Set<(delta: number) => void>()

    const eventEmitter = new p2.EventEmitter<SandboxEventMap>()

    const keyboardEventHandler = (event: KeyboardEvent) => {
        eventEmitter.emit(event)
    }
    window.addEventListener('keydown', keyboardEventHandler)
    window.addEventListener('keyup', keyboardEventHandler)

    const centerCamera = (x: number, y: number) => {
        container.position.x = renderer.width / 2 - container.scale.x * x
        container.position.y = renderer.height / 2 - container.scale.y * y
    }

    const frame = (x: number, y: number, w: number, h: number) => {
        const ratio = renderer.width / renderer.height
        if (ratio < w / h) {
            container.scale.x = renderer.width / w
            container.scale.y = -container.scale.x
        } else {
            container.scale.y = -renderer.height / h
            container.scale.x = -container.scale.y
        }
        centerCamera(x, y)
    }

    const onUpdate = {
        add: (fn: (delta: number) => void) => {
            sandboxUpdateHandlers.add(fn)
        },
        remove: (fn: (delta: number) => void) => {
            sandboxUpdateHandlers.delete(fn)
        },
    }

    const events: SandboxContext['events'] = {
        on: (event, callback) => {
            eventEmitter.on(event, callback)
        },
        off: (event, callback) => {
            eventEmitter.off(event, callback)
        },
        has: (event, callback) => {
            return eventEmitter.has(event, callback)
        },
    }

    const sandboxContext: SandboxContext = {
        centerCamera,
        frame,
        onUpdate,
        events,
    }

    const { world } = sandboxFunction(sandboxContext)

    const destroySandbox = () => {
        window.removeEventListener('keydown', keyboardEventHandler)
        window.removeEventListener('keyup', keyboardEventHandler)
    }

    return { world, sandboxUpdateHandlers, sandboxContext, destroySandbox }
}
