import { LinearSpring, vec2 } from 'p2-es'
import { useECS } from '../../ecs/ecsContext'
import { PhysicsSpringComponent } from '../../ecs/components/PhysicsSpringComponent'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { SettingsComponent } from '../../ecs/components/singletons/SettingsSingletonComponent'
import { SpriteComponent } from '../../ecs/components/SpriteComponent'
import { useFrame } from '../../hooks/useFrame'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { STAGES } from '../../stages'

export const PhysicsSpringRenderer = () => {
    const ecs = useECS()

    const pixiComponent = useSingletonComponent(PixiComponent)
    const settingsComponent = useSingletonComponent(SettingsComponent)

    const uninitialised = ecs.useQuery({
        all: [PhysicsSpringComponent],
        not: [SpriteComponent],
    })

    const renderable = ecs.useQuery([PhysicsSpringComponent, SpriteComponent])

    useFrame(
        () => {
            if (!settingsComponent || !pixiComponent) return

            const { settings } = settingsComponent
            const { container } = pixiComponent

            for (const entity of uninitialised.entities) {
                const { graphics } = entity.add(SpriteComponent)
                container.addChild(graphics)
            }

            for (const entity of renderable.entities) {
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
        },
        [pixiComponent, settingsComponent],
        STAGES.RENDER_SPRINGS
    )

    return null
}
