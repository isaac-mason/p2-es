import { Pixi } from '../ecs/components/singletons/PixiComponent'
import { PointerComponent } from '../ecs/components/singletons/PointerComponent'

export type SandboxContext = {
    pixi: Pixi

    pointer: PointerComponent

    centerCamera: (x: number, y: number) => void

    frame: (
        centerX: number,
        centerY: number,
        width: number,
        height: number
    ) => void

    onUpdate: {
        add: (callback: () => void) => void
        remove: (callback: () => void) => void
    }
}
