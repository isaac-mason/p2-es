import { FederatedMouseEvent } from 'pixi.js'
import { useEffect } from 'react'
import { useECS } from '../../ecs/ecsContext'
import { MouseComponent } from '../../ecs/components/singletons/MouseComponent'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'

const PHYSICS_POS = { x: 0, y: 0 }

export const MouseObserver = () => {
    const ecs = useECS()

    const pixi = useSingletonComponent(PixiComponent)

    useEffect(() => {
        if (!pixi) return

        const mouseEntity = ecs.world.create.entity()
        const mouseComponent = mouseEntity.add(MouseComponent)

        const mouseMoveHandler = ((e: FederatedMouseEvent) => {
            const stagePos = e.global

            mouseComponent.stagePosition.x = stagePos.x
            mouseComponent.stagePosition.y = stagePos.y

            const physicsPos = pixi.container.worldTransform.applyInverse(
                stagePos,
                PHYSICS_POS
            )

            mouseComponent.physicsPosition.x = physicsPos.x
            mouseComponent.physicsPosition.y = physicsPos.y

            mouseComponent.onMoveHandlers.forEach((handler) => handler())
        }) as never

        const mouseDownHandler = () => {
            mouseComponent.onDownHandlers.forEach((handler) => handler())
        }

        const mouseUpHandler = () => {
            mouseComponent.onUpHandlers.forEach((handler) => handler())
        }

        pixi.stage.addEventListener('mousemove', mouseMoveHandler, false)
        pixi.stage.addEventListener('mousedown', mouseDownHandler, false)
        pixi.stage.addEventListener('mouseup', mouseUpHandler, false)

        return () => {
            pixi.stage.removeEventListener('mousemove', mouseMoveHandler)
            pixi.stage.removeEventListener('mousedown', mouseDownHandler)
            pixi.stage.removeEventListener('mouseup', mouseUpHandler)

            mouseEntity.destroy()
        }
    }, [pixi])

    return null
}
