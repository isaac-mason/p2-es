import * as p2 from 'p2-es'
import { vec2 } from 'p2-es'
import { useEffect, useRef } from 'react'
import { PhysicsConstraintComponent } from '../../ecs/components/PhysicsConstraintComponent'
import { MouseComponent } from '../../ecs/components/singletons/MouseComponent'
import { PhysicsWorldComponent } from '../../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { useConst } from '../../hooks/useConst'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { useSingletonEntity } from '../../hooks/useSingletonEntity'

const PICK_PRECISION = 0.1

const SCROLL_FACTOR = 0.1

type InteractionState = 'default' | 'dragging' | 'panning' | 'pinching'

export const PickPanTool = () => {
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)
    const pixi = useSingletonComponent(PixiComponent)
    const mouseEntity = useSingletonEntity([MouseComponent])

    const interactionState = useRef<InteractionState>('default')

    const panningStartMousePosition = useRef([0, 0])
    const panningContainerStartPosition = useRef([0, 0])

    const pinchContainerInitialScale = useRef([0, 0])

    const mouseBody = useConst<p2.Body>(
        () => new p2.Body({ type: p2.Body.STATIC })
    )

    const mouseConstraint = useRef<p2.Constraint | null>(null)

    useEffect(() => {
        if (!pixi || !physicsWorld || !mouseEntity) return

        const { container } = pixi
        const mouse = mouseEntity.get(MouseComponent)

        const { physicsWorld: world } = physicsWorld

        const onUpHandler = () => {
            if (interactionState.current === 'dragging') {
                if (mouseConstraint.current) {
                    mouseEntity.remove(PhysicsConstraintComponent)
                    world.removeConstraint(mouseConstraint.current)
                    mouseConstraint.current = null
                }

                world.removeBody(mouseBody)
            }

            interactionState.current = 'default'
        }

        const onDownHandler = () => {
            if (interactionState.current === 'pinching') {
                return
            }

            if (
                interactionState.current === 'panning' ||
                interactionState.current === 'dragging'
            ) {
                onUpHandler()
            }

            const [x, y] = mouse.primaryPointer.physicsPosition
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
                mouseBody.position[0] = x
                mouseBody.position[1] = y

                // add mouse body to world
                world.addBody(mouseBody)

                // Get local point of the body to create the joint on
                const localPoint = p2.vec2.create()
                body.toLocalFrame(localPoint, mousePhysicsPosition)

                // Add mouse joint
                mouseConstraint.current = new p2.RevoluteConstraint(
                    mouseBody,
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

                const [stageX, stageY] = mouse.primaryPointer.stagePosition
                const { x: containerX, y: containerY } = container.position

                panningStartMousePosition.current[0] = stageX
                panningStartMousePosition.current[1] = stageY

                panningContainerStartPosition.current[0] = containerX
                panningContainerStartPosition.current[1] = containerY
            }
        }

        const onMoveHandler = () => {
            if (interactionState.current === 'panning') {
                const [stageX, stageY] = mouse.primaryPointer.stagePosition
                const [panningStartMouseX, panningStartMouseY] =
                    panningStartMousePosition.current
                const [panningContainerStartX, panningContainerStartY] =
                    panningContainerStartPosition.current

                container.position.x =
                    stageX - panningStartMouseX + panningContainerStartX

                container.position.y =
                    stageY - panningStartMouseY + panningContainerStartY

                return
            }

            if (interactionState.current === 'dragging') {
                const [x, y] = mouse.primaryPointer.physicsPosition
                mouseBody.position[0] = x
                mouseBody.position[1] = y
            }
        }

        const zoomByMultiplier = (
            x: number,
            y: number,
            zoomOut: boolean,
            multiplier: number
        ) => {
            let scrollFactor = SCROLL_FACTOR

            if (!zoomOut) {
                scrollFactor *= -1
            }

            scrollFactor *= Math.abs(multiplier!)

            container.scale.x *= 1 + scrollFactor
            container.scale.y *= 1 + scrollFactor
            container.position.x += scrollFactor * (container.position.x - x)
            container.position.y += scrollFactor * (container.position.y - y)
        }

        const zoomByScale = (
            x: number,
            y: number,
            actualScaleX: number,
            actualScaleY: number
        ) => {
            container.scale.x *= actualScaleX
            container.scale.y *= actualScaleY
            container.position.x +=
                (actualScaleX - 1) * (container.position.x - x)
            container.position.y +=
                (actualScaleY - 1) * (container.position.y - y)
        }

        const wheelHandler = (delta: number) => {
            const out = delta >= 0
            zoomByMultiplier(
                mouse.primaryPointer.stagePosition[0],
                mouse.primaryPointer.stagePosition[1],
                out,
                delta
            )
        }

        const pinchStartHandler = () => {
            if (interactionState.current === 'dragging') {
                onUpHandler()
            }

            interactionState.current = 'pinching'

            pinchContainerInitialScale.current = [
                container.scale.x,
                container.scale.y,
            ]
        }

        const pinchEndHandler = () => {
            interactionState.current = 'default'
        }

        const pinchMoveHandler = () => {
            interactionState.current = 'pinching'

            const touchA = mouse.touches[mouse.pinchATouch!]
            const touchB = mouse.touches[mouse.pinchBTouch!]

            const tmp = vec2.create()

            // Get center
            vec2.add(tmp, touchA.physicsPosition, touchB.physicsPosition)
            vec2.scale(tmp, touchA.physicsPosition, 0.5)

            const pinchChange = mouse.pinchLength! / mouse.pinchInitialLength!

            const actualScaleX =
                pinchChange * pinchContainerInitialScale.current[0]

            const actualScaleY =
                pinchChange * pinchContainerInitialScale.current[1] // zoom relative to the initial scale

            console.log('current scale', container.scale.x, container.scale.y)
            console.log(pinchChange, actualScaleX, actualScaleY)

            const x = (touchA.stagePosition[0] + touchB.stagePosition[0]) * 0.5
            const y = (touchA.stagePosition[1] + touchB.stagePosition[1]) * 0.5

            console.log(x, y)

            // zoomByScale(x, y, actualScaleX, actualScaleY)
            zoomByScale(x, y, pinchChange, pinchChange)
        }

        mouse.onWheel.add(wheelHandler)

        mouse.onPinchStart.add(pinchStartHandler)
        mouse.onPinchMove.add(pinchMoveHandler)
        mouse.onPinchEnd.add(pinchEndHandler)

        mouse.onMove.add(onMoveHandler)
        mouse.onDown.add(onDownHandler)
        mouse.onUp.add(onUpHandler)

        return () => {
            onUpHandler()

            mouse.onWheel.delete(wheelHandler)

            mouse.onPinchStart.delete(pinchStartHandler)
            mouse.onPinchMove.delete(pinchMoveHandler)
            mouse.onPinchEnd.delete(pinchEndHandler)

            mouse.onMove.delete(onMoveHandler)
            mouse.onDown.delete(onDownHandler)
            mouse.onUp.delete(onUpHandler)
        }
    }, [pixi, physicsWorld, mouseEntity])

    return null
}
