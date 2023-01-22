import { useEffect } from 'react'
import { MouseComponent } from '../ecs/components/singletons/MouseComponent'
import { PixiComponent } from '../ecs/components/singletons/PixiComponent'
import { useSingletonComponent } from '../hooks/useSingletonComponent'

const SCROLL_FACTOR = 0.1

export const ZoomHandler = () => {
    const pixi = useSingletonComponent(PixiComponent)
    const mouse = useSingletonComponent(MouseComponent)

    useEffect(() => {
        if (!pixi || !mouse) return

        const { container, canvasElement } = pixi

        const zoom = (x: number, y: number, multiplier: number) => {
            const zoomOut = multiplier >= 0

            let scrollFactor = SCROLL_FACTOR

            if (!zoomOut) {
                scrollFactor *= -1
            }

            scrollFactor *= Math.abs(multiplier)

            container.scale.x *= 1 + scrollFactor
            container.scale.y *= 1 + scrollFactor
            container.position.x += scrollFactor * (container.position.x - x)
            container.position.y += scrollFactor * (container.position.y - y)
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

            zoom(mouse.stagePosition.x, mouse.stagePosition.y, delta)
        }

        canvasElement.addEventListener('wheel', wheelHandler, false)

        return () => {
            canvasElement.removeEventListener('wheel', wheelHandler, false)
        }
    }, [pixi, mouse])

    return null
}
