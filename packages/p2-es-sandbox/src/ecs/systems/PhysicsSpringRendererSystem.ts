import { System } from 'arancini'
import { LinearSpring, vec2 } from 'p2-es'
import { PhysicsSpringComponent } from '../components/PhysicsSpringComponent'
import { PixiComponent } from '../components/singletons/PixiComponent'
import {
    Settings,
    SettingsComponent,
} from '../components/singletons/SettingsSingletonComponent'
import { SpriteComponent } from '../components/SpriteComponent'

export class PhysicsSpringRendererSystem extends System {
    queries = {
        pixi: this.query([PixiComponent]),
        withoutSprite: this.query({
            all: [PhysicsSpringComponent],
            not: [SpriteComponent],
        }),
        toRender: this.query({
            all: [PhysicsSpringComponent, SpriteComponent],
        }),
        settings: this.query([SettingsComponent]),
    }

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
            const { spring } = entity.get(PhysicsSpringComponent)
            const sprite = entity.get(SpriteComponent)
            const { graphics } = sprite

            if (spring instanceof LinearSpring) {
                const bA = spring.bodyA
                const bB = spring.bodyB

                let worldAnchorA = vec2.fromValues(0, 0)
                let worldAnchorB = vec2.fromValues(0, 0)
                const X = vec2.fromValues(1, 0)
                const distVec = vec2.fromValues(0, 0)

                if (settings.useInterpolatedPositions && !settings.paused) {
                    vec2.toGlobalFrame(
                        worldAnchorA,
                        spring.localAnchorA,
                        bA.interpolatedPosition,
                        bA.interpolatedAngle
                    )
                    vec2.toGlobalFrame(
                        worldAnchorB,
                        spring.localAnchorB,
                        bB.interpolatedPosition,
                        bB.interpolatedAngle
                    )
                } else {
                    spring.getWorldAnchorA(worldAnchorA)
                    spring.getWorldAnchorB(worldAnchorB)
                }

                graphics.scale.y = 1
                if (worldAnchorA[1] < worldAnchorB[1]) {
                    const tmp = worldAnchorA
                    worldAnchorA = worldAnchorB
                    worldAnchorB = tmp
                    graphics.scale.y = -1
                }

                const sxA = worldAnchorA[0]
                const syA = worldAnchorA[1]
                const sxB = worldAnchorB[0]
                const syB = worldAnchorB[1]

                // Spring position is the mean point between the anchors
                graphics.position.x = (sxA + sxB) / 2
                graphics.position.y = (syA + syB) / 2

                // Compute distance vector between anchors, in screen coords
                distVec[0] = sxA - sxB
                distVec[1] = syA - syB

                // Compute angle
                graphics.rotation = Math.acos(
                    vec2.dot(X, distVec) / vec2.length(distVec)
                )

                // And scale
                graphics.scale.x = vec2.length(distVec) / spring.restLength
            }
        }
    }
}
