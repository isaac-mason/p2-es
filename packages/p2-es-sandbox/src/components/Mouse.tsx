import { FederatedMouseEvent } from 'pixi.js'
import { useEffect } from 'react'
import { useECS } from '../context/ecsContext'
import { MouseComponent } from '../ecs/components/MouseComponent'
import { PixiComponent } from '../ecs/components/PixiComponent'
import { useSingletonComponent } from '../hooks/useSingletonComponent'

export const Mouse = () => {
    const ecs = useECS()
    const pixi = useSingletonComponent(PixiComponent)

    useEffect(() => {
        if (!pixi) return

        const mouseEntity = ecs.world.create.entity()
        const mouseComponent = mouseEntity.add(MouseComponent)

        const handler = ((e: FederatedMouseEvent) => {
            const stagePos = e.global

            mouseComponent.stagePosition.x = stagePos.x
            mouseComponent.stagePosition.y = stagePos.y

            const physicsPos =
                pixi.container.worldTransform.applyInverse(stagePos)

            mouseComponent.physicsPosition.x = physicsPos.x
            mouseComponent.physicsPosition.y = physicsPos.y
        }) as never

        pixi.stage.addEventListener('mousemove', handler, false)

        return () => {
            pixi.stage.removeEventListener('mousemove', handler, false)
            mouseEntity.destroy()
        }
    }, [pixi])

    return null
}
