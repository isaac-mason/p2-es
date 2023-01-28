import { useEffect } from 'react'
import { UpdateHandlerComponent } from '../ecs/components/UpdateHandlerComponent'
import { useECS } from './useECS'

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
