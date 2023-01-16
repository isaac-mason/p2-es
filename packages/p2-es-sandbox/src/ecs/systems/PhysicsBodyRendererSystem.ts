import { System } from 'arancini'
import { Body } from 'p2-es'
import { drawRenderable } from '../../pixi/drawRenderable'
import { randomPastelHex } from '../../utils/randomPastelHex'
import { PhysicsBodyComponent } from '../components/PhysicsBodyComponent'
import { PixiComponent } from '../components/PixiComponent'
import { Settings, SettingsComponent } from '../components/SettingsComponent'
import { SpriteComponent } from '../components/SpriteComponent'

const LINE_WIDTH = 0.01
const SLEEP_OPACITY = 0.2

export class PhysicsBodyRendererSystem extends System {
    queries = {
        pixi: this.query([PixiComponent]),
        withoutSprite: this.query({
            all: [PhysicsBodyComponent],
            not: [SpriteComponent],
        }),
        toRender: this.query({
            all: [PhysicsBodyComponent, SpriteComponent],
        }),
        settings: this.query([SettingsComponent]),
    }

    islandColors: { [body: number]: number } = {}

    get pixi(): PixiComponent | undefined {
        return this.queries.pixi.first?.find(PixiComponent)
    }

    get settings(): Settings | undefined {
        return this.queries.settings.first?.find(SettingsComponent)?.settings
    }

    onUpdate() {
        const { settings, pixi } = this
        if (!settings || !pixi) {
            return
        }

        for (const entity of this.queries.withoutSprite.entities) {
            const { graphics } = entity.add(SpriteComponent)
            pixi.container.addChild(graphics)
        }

        for (const entity of this.queries.toRender.entities) {
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
            const islandColor = this.getIslandColor(body)
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
    }

    private getIslandColor(body: Body) {
        if (body.islandId === -1) {
            return 0xdddddd // Gray for static objects
        }
        if (this.islandColors[body.islandId]) {
            return this.islandColors[body.islandId]
        }
        const color = parseInt(randomPastelHex(), 16)
        this.islandColors[body.islandId] = color

        return color
    }
}
