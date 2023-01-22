import { useEffect } from 'react'
import { useECS } from '../context/ecsContext'
import { UpdateHandlersComponent } from '../ecs/components/singletons/UpdateHandlersSingletonComponent'
import { useSingletonComponent } from '../hooks/useSingletonComponent'
import { loop } from '../utils/loop'

export const Loop = () => {
    const ecs = useECS()

    const updateHandlersComponent = useSingletonComponent(
        UpdateHandlersComponent
    )

    useEffect(() => {
        if (!updateHandlersComponent) return

        const { updateHandlers } = updateHandlersComponent

        const stop = loop((delta) => {
            ecs.update(delta)
            updateHandlers.forEach((handler) => handler(delta))
        })

        return () => {
            stop()
        }
    }, [updateHandlersComponent])

    return null
}
