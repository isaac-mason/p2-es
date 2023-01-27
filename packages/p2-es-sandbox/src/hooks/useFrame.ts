import { useEffect } from 'react'
import { useECS } from '../ecs/ecsContext'
import { UpdateHandlerComponent } from '../ecs/components/UpdateHandlerComponent'

export const useFrame = (
    fn: (delta: number) => void,
    dependencies: unknown[],
    priority = 0
) => {
    const ecs = useECS()

    useEffect(() => {
        const entity = ecs.world.create.entity()
        entity.add(UpdateHandlerComponent, fn, priority)

        return () => {
            entity.destroy()
        }
    }, dependencies)
}
