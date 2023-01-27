import { useEffect } from 'react'
import { useECS } from '../ecs/ecsContext'
import { UpdateHandlerComponent } from '../ecs/components/UpdateHandlerComponent'
import { loop } from '../utils/loop'

export const Loop = () => {
    const ecs = useECS()

    useEffect(() => {
        const updateHandlersQuery = ecs.world.create.query([
            UpdateHandlerComponent,
        ])

        const sortedHandlers = () => {
            return updateHandlersQuery.entities
                .map((e) => e.get(UpdateHandlerComponent))
                .sort((a, b) => a.priority - b.priority)
        }

        const sortedUpdateHandlers = sortedHandlers()

        updateHandlersQuery.onEntityAdded.add(sortedHandlers)
        updateHandlersQuery.onEntityRemoved.add(sortedHandlers)

        const stop = loop((delta) => {
            sortedUpdateHandlers.forEach((handler) => handler.fn(delta))
        })

        return () => {
            stop()
            updateHandlersQuery.onEntityAdded.remove(sortedHandlers)
            updateHandlersQuery.onEntityRemoved.remove(sortedHandlers)
            updateHandlersQuery.destroy()
        }
    }, [])

    return null
}
