import { Body } from 'p2-es'
import { useCallback } from 'react'
import { PhysicsBodyComponent } from '../../ecs/components/PhysicsBodyComponent'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { SettingsComponent } from '../../ecs/components/singletons/SettingsSingletonComponent'
import { SpriteComponent } from '../../ecs/components/SpriteComponent'
import { useConst } from '../../hooks/useConst'
import { useECS } from '../../hooks/useECS'
import { useFrame } from '../../hooks/useFrame'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { STAGES } from '../../stages'
import { randomPastelHex } from '../../utils/color/randomPastelHex'
import { drawRenderable } from '../../utils/pixi/drawRenderable'

const LINE_WIDTH = 0.01
const SLEEP_OPACITY = 0.2

export const PhysicsBodyRenderer = () => {
    const ecs = useECS()

    const pixiComponent = useSingletonComponent(PixiComponent)
    const settingsComponent = useSingletonComponent(SettingsComponent)

    const uninitialised = ecs.useQuery({
        all: [PhysicsBodyComponent],
        not: [SpriteComponent],
    })

    const renderable = ecs.useQuery([PhysicsBodyComponent, SpriteComponent])

    const islandColors = useConst<{ [body: number]: number }>(() => ({}))

    const getIslandColor = useCallback((body: Body) => {
        if (body.islandId === -1) {
            return 0xdddddd // Gray for static objects
        }
        if (islandColors[body.islandId]) {
            return islandColors[body.islandId]
        }
        const color = parseInt(randomPastelHex(), 16)
        islandColors[body.islandId] = color

        return color
    }, [])

    useFrame(
        () => {
            if (!settingsComponent || !pixiComponent) {
                return
            }

            const { settings } = settingsComponent
            const { container } = pixiComponent

            for (const entity of uninitialised.entities) {
                const { graphics } = entity.add(SpriteComponent)
                container.addChild(graphics)
            }

            for (const entity of renderable.entities) {
                const { body } = entity.get(PhysicsBodyComponent)
                const sprite = entity.get(SpriteComponent)
                const { graphics } = sprite

                // update body transform
                if (settings.useInterpolatedPositions && !settings.paused) {
                    const [x, y] = body.interpolatedPosition
                    graphics.position.x = x
                    graphics.position.y = y
                    graphics.rotation = body.interpolatedAngle
                } else {
                    const [x, y] = body.position
                    graphics.position.x = x
                    graphics.position.y = y
                    graphics.rotation = body.angle
                }

                // update graphics if body changed sleepState or island
                const isSleeping = body.sleepState === Body.SLEEPING
                const islandColor = getIslandColor(body)
                if (
                    sprite.drawnSleeping !== isSleeping ||
                    sprite.drawnFillColor !== islandColor
                ) {
                    graphics.clear()
                    drawRenderable({
                        renderable: body,
                        sprite,
                        fillColor: islandColor,
                        lineColor: sprite.drawnLineColor ?? 0x000000,
                        debugPolygons: settings.debugPolygons,
                        lineWidth: LINE_WIDTH,
                        sleepOpacity: SLEEP_OPACITY,
                    })
                }
            }
        },
        [pixiComponent, settingsComponent],
        STAGES.RENDER_BODIES
    )

    return null
}
