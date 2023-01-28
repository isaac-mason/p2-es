import { vec2 } from 'p2-es'
import { FederatedEvent, FederatedMouseEvent } from 'pixi.js'
import { useEffect } from 'react'
import { MouseComponent } from '../../ecs/components/singletons/MouseComponent'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { useECS } from '../../hooks/useECS'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'

const tmpVec2 = { x: 0, y: 0 }

export const MouseObserver = () => {
    const ecs = useECS()

    const pixi = useSingletonComponent(PixiComponent)

    useEffect(() => {
        if (!pixi) return

        const mouseEntity = ecs.world.create.entity()
        const mouse = mouseEntity.add(MouseComponent)

        const getPhysicsPosition = (stagePosition: {
            x: number
            y: number
        }): [number, number] => {
            const { x, y } = pixi.container.worldTransform.applyInverse(
                stagePosition,
                tmpVec2
            )
            return [x, y]
        }

        const updateMouseComponentPositions = (stagePosition: {
            x: number
            y: number
        }) => {
            mouse.primaryPointer.stagePosition[0] = stagePosition.x
            mouse.primaryPointer.stagePosition[1] = stagePosition.y

            const [physicsX, physicsY] = getPhysicsPosition(stagePosition)

            mouse.primaryPointer.physicsPosition[0] = physicsX
            mouse.primaryPointer.physicsPosition[1] = physicsY
        }

        const updateTouches = (e: FederatedMouseEvent) => {
            if (
                e.nativeEvent.type === 'touchmove' ||
                e.nativeEvent.type === 'touchstart'
            ) {
                const touchmove = e as FederatedEvent<PointerEvent>

                const stagePosition: [number, number] = [e.global.x, e.global.y]
                const physicsPosition: [number, number] = [
                    ...getPhysicsPosition(e.global),
                ]

                mouse.touches[touchmove.nativeEvent.pointerId] = {
                    stagePosition,
                    physicsPosition,
                }
            } else if (e.nativeEvent.type === 'touchend') {
                const touchend = e as FederatedEvent<PointerEvent>
                delete mouse.touches[touchend.nativeEvent.pointerId]
            }
        }

        const updatePinch = () => {
            const nTouches = Object.keys(mouse.touches).length

            if (!mouse.pinching && nTouches > 1) {
                mouse.pinching = true

                const touchKeys = Object.keys(mouse.touches)
                const [touchAKey, touchBKey] = touchKeys

                const touchA = mouse.touches[touchAKey]
                const touchB = mouse.touches[touchBKey]

                mouse.pinchATouch = touchAKey
                mouse.pinchBTouch = touchBKey

                mouse.pinchLength = vec2.distance(
                    touchA.physicsPosition,
                    touchB.physicsPosition
                )

                mouse.pinchInitialLength = mouse.pinchLength

                mouse.onPinchStart.forEach((fn) => fn())
            } else if (mouse.pinching) {
                if (
                    mouse.pinchATouch &&
                    mouse.pinchBTouch &&
                    mouse.touches[mouse.pinchATouch] &&
                    mouse.touches[mouse.pinchBTouch]
                ) {
                    const touchA = mouse.touches[mouse.pinchATouch]
                    const touchB = mouse.touches[mouse.pinchBTouch]

                    mouse.pinchLength = vec2.distance(
                        touchA.physicsPosition,
                        touchB.physicsPosition
                    )

                    mouse.onPinchMove.forEach((fn) => fn())
                } else {
                    mouse.pinching = false
                    mouse.pinchATouch = undefined
                    mouse.pinchBTouch = undefined
                    mouse.pinchLength = 0
                    mouse.pinchInitialLength = 0

                    mouse.onPinchEnd.forEach((fn) => fn())
                }
            }
        }

        const moveHandler = ((e: FederatedMouseEvent) => {
            updateMouseComponentPositions(e.global)

            updateTouches(e)

            updatePinch()

            mouse.onMove.forEach((handler) => handler(e))
        }) as never

        const downHandler = ((e: FederatedMouseEvent) => {
            updateMouseComponentPositions(e.global)

            updateTouches(e)

            updatePinch()

            mouse.onDown.forEach((handler) => handler(e))
        }) as never

        const upHandler = ((e: FederatedMouseEvent) => {
            updateMouseComponentPositions(e.global)

            updateTouches(e)

            updatePinch()

            mouse.onUp.forEach((handler) => handler(e))
        }) as never

        pixi.canvasElement.ontouchmove = (e: Event) => {
            e.preventDefault()
        }

        const wheelHandler = (event: WheelEvent) => {
            const n = 225
            const n1 = n - 1

            let delta = event.deltaY

            // noramlize delta
            delta = -delta / 1.35

            // quadratic scale if |d| > 1
            if (delta < 1) {
                delta = delta < -1 ? (-(delta ** 2) - n1) / n : delta
            } else {
                delta = (delta ** 2 + n1) / n
            }

            // delta should not be greater than 2
            delta = Math.min(Math.max(delta / 2, -1), 1)

            mouse.onWheel.forEach((handler) => handler(delta))
        }

        pixi.stage.addEventListener('pointermove', moveHandler, false)
        pixi.stage.addEventListener('pointerdown', downHandler, false)
        pixi.stage.addEventListener('pointerup', upHandler, false)
        pixi.canvasElement.addEventListener('wheel', wheelHandler, false)

        return () => {
            pixi.stage.removeEventListener('pointermove', moveHandler)
            pixi.stage.removeEventListener('pointerdown', downHandler)
            pixi.stage.removeEventListener('pointerup', upHandler)
            pixi.canvasElement.removeEventListener('wheel', wheelHandler, false)

            mouseEntity.destroy()
        }
    }, [pixi])

    return null
}
