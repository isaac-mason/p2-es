import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import { PhysicsWorldComponent } from '../../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { PointerComponent } from '../../ecs/components/singletons/PointerComponent'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { useSingletonEntity } from '../../hooks/useSingletonEntity'
import { drawCircle } from '../../utils/pixi/drawCircle'

type CircleToolState = 'default' | 'drawing'

export type CircleToolProps = {
    newShapeCollisionGroup?: number
    newShapeCollisionMask?: number
}

export const CircleTool = ({
    newShapeCollisionGroup,
    newShapeCollisionMask,
}: CircleToolProps) => {
    const physicsWorldComponent = useSingletonComponent(PhysicsWorldComponent)
    const pixiComponent = useSingletonComponent(PixiComponent)
    const pointerEntity = useSingletonEntity([PointerComponent])

    const toolState = useRef<CircleToolState>('default')
    const circleCenter = useRef<[number, number]>([0, 0])
    const circleRadius = useRef<number>(0)

    useEffect(() => {
        if (!pixiComponent || !physicsWorldComponent || !pointerEntity) return

        const pointer = pointerEntity.get(PointerComponent)
        const { world } = physicsWorldComponent

        const updateGraphics = () => {
            const { drawShape: graphics } = pixiComponent.graphics
            graphics.clear()

            if (toolState.current === 'default') return

            drawCircle({
                graphics,
                x: circleCenter.current[0],
                y: circleCenter.current[1],
                angle: 0,
                radius: circleRadius.current,
                lineColor: 0x000000,
                lineWidth: 0.01,
            })
        }

        const onUpHandler = () => {
            if (toolState.current === 'drawing') {
                if (circleRadius.current > 0) {
                    // Create circle
                    const body = new p2.Body({
                        mass: 1,
                        position: circleCenter.current,
                    })
                    const circle = new p2.Circle({
                        radius: circleRadius.current,
                    })

                    body.wakeUp()
                    if (newShapeCollisionMask) {
                        circle.collisionMask = newShapeCollisionMask
                    }
                    if (newShapeCollisionGroup) {
                        circle.collisionGroup = newShapeCollisionGroup
                    }

                    body.addShape(circle)
                    world.addBody(body)
                }
            }

            toolState.current = 'default'
            updateGraphics()
        }

        const getRadius = (center: p2.Vec2, point: p2.Vec2) => {
            return p2.vec2.distance(center, point)
        }

        const onDownHandler = () => {
            toolState.current = 'drawing'
            circleCenter.current = [...pointer.primaryPointer.physicsPosition]
            circleRadius.current = getRadius(
                circleCenter.current,
                pointer.primaryPointer.physicsPosition
            )
            updateGraphics()
        }

        const onMoveHandler = () => {
            if (toolState.current !== 'drawing') return

            circleRadius.current = getRadius(
                circleCenter.current,
                pointer.primaryPointer.physicsPosition
            )
            updateGraphics()
        }

        pointer.onMove.add(onMoveHandler)
        pointer.onDown.add(onDownHandler)
        pointer.onUp.add(onUpHandler)

        return () => {
            onUpHandler()

            pointer.onMove.delete(onMoveHandler)
            pointer.onDown.delete(onDownHandler)
            pointer.onUp.delete(onUpHandler)
        }
    }, [pixiComponent, physicsWorldComponent, pointerEntity])

    return null
}
