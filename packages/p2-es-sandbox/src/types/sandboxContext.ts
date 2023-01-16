import type { SandboxEventMap } from './events'

export type SandboxContext = {
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

    events: {
        on<T extends keyof SandboxEventMap>(
            event: T,
            callback: (event: SandboxEventMap[T]) => void
        ): void

        off<T extends keyof SandboxEventMap>(
            event: T,
            callback: (event: SandboxEventMap[T]) => void
        ): void

        has<T extends keyof SandboxEventMap>(
            event: T,
            callback: (event: SandboxEventMap[T]) => void
        ): boolean
    }
}
