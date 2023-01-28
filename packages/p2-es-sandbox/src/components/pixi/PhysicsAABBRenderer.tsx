import { PhysicsWorldComponent } from '../../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { SettingsComponent } from '../../ecs/components/singletons/SettingsSingletonComponent'
import { useFrame } from '../../hooks/useFrame'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { STAGES } from '../../stages'

const LINE_WIDTH = 0.01

export const PhysicsAABBRenderer = () => {
    const pixiComponent = useSingletonComponent(PixiComponent)
    const settingsComponent = useSingletonComponent(SettingsComponent)
    const physicsWorldComponent = useSingletonComponent(PhysicsWorldComponent)

    useFrame(
        () => {
            if (!pixiComponent || !settingsComponent || !physicsWorldComponent)
                return

            const { settings } = settingsComponent
            const { graphics, container } = pixiComponent
            const { world } = physicsWorldComponent

            if (settings.drawAABBs) {
                graphics.aabb.clear()
                container.removeChild(graphics.aabb)
                container.addChild(graphics.aabb)

                const g = graphics.aabb
                g.lineStyle(LINE_WIDTH, 0x000000, 1)

                for (let i = 0; i !== world.bodies.length; i++) {
                    const aabb = world.bodies[i].getAABB()
                    g.drawRect(
                        aabb.lowerBound[0],
                        aabb.lowerBound[1],
                        aabb.upperBound[0] - aabb.lowerBound[0],
                        aabb.upperBound[1] - aabb.lowerBound[1]
                    )
                }
            } else {
                graphics.aabb.clear()
            }
        },
        [pixiComponent, settingsComponent, physicsWorldComponent],
        STAGES.RENDER_AABBS
    )

    return null
}
