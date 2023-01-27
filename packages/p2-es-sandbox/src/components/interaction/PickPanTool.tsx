import * as p2 from 'p2-es'
import { useEffect, useRef } from 'react'
import { PhysicsConstraintComponent } from '../../ecs/components/PhysicsConstraintComponent'
import { MouseComponent } from '../../ecs/components/singletons/MouseComponent'
import { PhysicsWorldComponent } from '../../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { useSingletonEntity } from '../../hooks/useSingletonEntity'

const PICK_PRECISION = 0.1

type InteractionState = 'default' | 'dragging' | 'panning'

export const PickPanTool = () => {
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)
    const pixi = useSingletonComponent(PixiComponent)
    const mouseEntity = useSingletonEntity([MouseComponent])

    const interactionState = useRef<InteractionState>('default')

    const panningStartMousePosition = useRef({ x: 0, y: 0 })
    const panningContainerStartPosition = useRef({ x: 0, y: 0 })

    const mouseBody = useRef<p2.Body>(null!)
    const mouseConstraint = useRef<p2.Constraint | null>(null)

    useEffect(() => {
        if (!pixi || !physicsWorld || !mouseEntity) return

        const mouse = mouseEntity.get(MouseComponent)

        const { physicsWorld: world } = physicsWorld

        mouseBody.current = new p2.Body({ type: p2.Body.STATIC })

        const onUpHandler = () => {
            if (interactionState.current === 'dragging') {
                if (mouseConstraint.current) {
                    mouseEntity.remove(PhysicsConstraintComponent)
                    world.removeConstraint(mouseConstraint.current)
                    mouseConstraint.current = null
                }

                if (mouseBody.current) {
                    world.removeBody(mouseBody.current)
                }
            }

            interactionState.current = 'default'
        }

        const onDownHandler = () => {
            if (interactionState.current !== 'default') {
                onUpHandler()
            }
            const { x, y } = mouse.physicsPosition
            const mousePhysicsPosition: [number, number] = [x, y]

            const hitTest = world.hitTest(
                mousePhysicsPosition,
                world.bodies,
                PICK_PRECISION
            )

            // Remove static bodies
            let body: p2.Body | undefined
            while (hitTest.length > 0) {
                body = hitTest.shift()
                if (body && body.type === p2.Body.STATIC) {
                    body = undefined
                } else {
                    break
                }
            }

            if (body) {
                body.wakeUp()

                interactionState.current = 'dragging'

                // move the mouse body
                mouseBody.current.position[0] = mouse.physicsPosition.x
                mouseBody.current.position[1] = mouse.physicsPosition.y

                // add mouse body to world
                world.addBody(mouseBody.current)

                // Get local point of the body to create the joint on
                const localPoint = p2.vec2.create()
                body.toLocalFrame(localPoint, mousePhysicsPosition)

                // Add mouse joint
                mouseConstraint.current = new p2.RevoluteConstraint(
                    mouseBody.current,
                    body,
                    {
                        localPivotA: [0, 0],
                        localPivotB: localPoint,
                        maxForce: 1000 * body.mass,
                    }
                )
                world.addConstraint(mouseConstraint.current)

                mouseEntity.add(
                    PhysicsConstraintComponent,
                    mouseConstraint.current
                )
            } else {
                interactionState.current = 'panning'

                panningStartMousePosition.current.x = mouse.stagePosition.x
                panningStartMousePosition.current.y = mouse.stagePosition.y

                panningContainerStartPosition.current.x =
                    pixi.container.position.x
                panningContainerStartPosition.current.y =
                    pixi.container.position.y
            }
        }

        const onMoveHandler = () => {
            if (interactionState.current === 'panning') {
                pixi.container.position.x =
                    mouse.stagePosition.x -
                    panningStartMousePosition.current.x +
                    panningContainerStartPosition.current.x

                pixi.container.position.y =
                    mouse.stagePosition.y -
                    panningStartMousePosition.current.y +
                    panningContainerStartPosition.current.y

                return
            }

            if (interactionState.current === 'dragging') {
                mouseBody.current.position[0] = mouse.physicsPosition.x
                mouseBody.current.position[1] = mouse.physicsPosition.y
            }
        }

        mouse.onMoveHandlers.add(onMoveHandler)
        mouse.onDownHandlers.add(onDownHandler)
        mouse.onUpHandlers.add(onUpHandler)

        return () => {
            onUpHandler()

            mouse.onMoveHandlers.delete(onMoveHandler)
            mouse.onDownHandlers.delete(onDownHandler)
            mouse.onUpHandlers.delete(onUpHandler)
        }
    }, [pixi, physicsWorld, mouseEntity])

    return null
}
