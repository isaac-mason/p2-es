import * as p2 from 'p2-es'
import { Pixi } from '../ecs/components/singletons/PixiComponent'
import { PointerComponent } from '../ecs/components/singletons/PointerComponent'
import { SandboxContext, SandboxEventMap, SandboxFunction } from '../types'

export type SandboxFunctionEvaluatorProps = {
    pixi: Pixi
    pointer: PointerComponent
    sandboxFunction: SandboxFunction
}

export const sandboxFunctionEvaluator = ({
    pixi,
    pointer,
    sandboxFunction,
}: SandboxFunctionEvaluatorProps) => {
    const { application, container } = pixi

    const updateHandlers = new Set<(delta: number) => void>()

    const eventEmitter = new p2.EventEmitter<SandboxEventMap>()

    const keyboardEventHandler = (event: KeyboardEvent) => {
        eventEmitter.emit(event)
    }
    window.addEventListener('keydown', keyboardEventHandler)
    window.addEventListener('keyup', keyboardEventHandler)

    const centerCamera = (x: number, y: number) => {
        container.position.x =
            application.renderer.width / 2 - container.scale.x * x
        container.position.y =
            application.renderer.height / 2 - container.scale.y * y
    }

    const frame = (x: number, y: number, w: number, h: number) => {
        const ratio = application.renderer.width / application.renderer.height
        if (ratio < w / h) {
            container.scale.x = application.renderer.width / w
            container.scale.y = -container.scale.x
        } else {
            container.scale.y = -application.renderer.height / h
            container.scale.x = -container.scale.y
        }
        centerCamera(x, y)
    }

    const onUpdate = {
        add: (fn: (delta: number) => void) => {
            updateHandlers.add(fn)
        },
        remove: (fn: (delta: number) => void) => {
            updateHandlers.delete(fn)
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
        pointer,
        centerCamera,
        frame,
        onUpdate,
        events,
    }

    // default view
    frame(0, 0, 8, 6)

    const { world, defaultTool, teardown } = sandboxFunction(sandboxContext)

    const destroySandbox = () => {
        window.removeEventListener('keydown', keyboardEventHandler)
        window.removeEventListener('keyup', keyboardEventHandler)

        if (teardown) {
            teardown()
        }
    }

    return {
        world,
        defaultTool,
        updateHandlers,
        sandboxContext,
        destroySandbox,
    }
}
