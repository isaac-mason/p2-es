import { createECS } from '@arancini/react'
import { World } from 'arancini'
import { useMemo } from 'react'
import { useWorld } from '../ecs/worldContext'

const ecsStore = new Map<World, ReturnType<typeof createECS>>()

export const useECS = () => {
    const world = useWorld()

    return useMemo(() => {
        let ecs = ecsStore.get(world)
        if (ecs) {
            return ecs
        }

        ecs = createECS(world)
        ecsStore.set(world, ecs)

        return ecs
    }, [world])
}
