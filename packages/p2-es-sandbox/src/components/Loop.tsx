import { useEffect } from 'react'
import { UpdateHandlerComponent } from '../ecs/components/UpdateHandlerComponent'
import { useECS } from '../hooks/useECS'
import { usePageVisible } from '../hooks/usePageVisible'

const loop = (fn: (delta: number) => void) => {
    let animationFrameRequest = 0
    let previousTime: undefined | number

    const animate = (time: number) => {
        const timeMs = time / 1000
        if (previousTime !== undefined) {
            const delta = timeMs - previousTime

            const clampedDelta = Math.min(delta, 1)

            fn(clampedDelta)
        }
        previousTime = timeMs
        animationFrameRequest = requestAnimationFrame(animate)
    }

    animationFrameRequest = requestAnimationFrame(animate)

    return () => {
        cancelAnimationFrame(animationFrameRequest)
    }
}

export const Loop = () => {
    const ecs = useECS()
    const pageVisible = usePageVisible()

    useEffect(() => {
        if (!pageVisible) return

        const updateHandlersQuery = ecs.world.create.query([
            UpdateHandlerComponent,
        ])

        let sortedUpdateHandlers: UpdateHandlerComponent[] = []

        const sortHandlers = () => {
            sortedUpdateHandlers = updateHandlersQuery.entities
                .map((e) => e.get(UpdateHandlerComponent))
                .sort((a, b) => a.priority - b.priority)
        }

        updateHandlersQuery.onEntityAdded.add(() => sortHandlers())
        updateHandlersQuery.onEntityRemoved.add(() => sortHandlers())

        const stop = loop((delta) => {
            sortedUpdateHandlers.forEach((handler) => handler.fn.current(delta))
        })

        return () => {
            updateHandlersQuery.onEntityAdded.remove(sortHandlers)
            updateHandlersQuery.onEntityRemoved.remove(sortHandlers)
            updateHandlersQuery.destroy()
            stop()
        }
    }, [pageVisible])

    return null
}
