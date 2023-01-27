import { PhysicsWorldComponent } from '../../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { SettingsComponent } from '../../ecs/components/singletons/SettingsSingletonComponent'
import { useFrame } from '../../hooks/useFrame'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { STAGES } from '../../stages'

const LINE_WIDTH = 0.01

export const PhysicsContactRenderer = () => {
    const pixiComponent = useSingletonComponent(PixiComponent)
    const physicsWorldComponent = useSingletonComponent(PhysicsWorldComponent)
    const settingsComponent = useSingletonComponent(SettingsComponent)

    useFrame(
        () => {
            if (!settingsComponent || !pixiComponent || !physicsWorldComponent)
                return

            const { settings } = settingsComponent
            const { graphics, container } = pixiComponent
            const { physicsWorld: world } = physicsWorldComponent

            // Draw contacts
            if (settings.drawContacts) {
                graphics.contacts.clear()
                container.removeChild(graphics.contacts)
                container.addChild(graphics.contacts)

                const g = graphics.contacts
                g.lineStyle(LINE_WIDTH, 0x000000, 1)
                for (
                    let i = 0;
                    i !== world.narrowphase.contactEquations.length;
                    i++
                ) {
                    const eq = world.narrowphase.contactEquations[i]
                    const bi = eq.bodyA
                    const bj = eq.bodyB
                    const ri = eq.contactPointA
                    const rj = eq.contactPointB
                    const xi = bi.position[0]
                    const yi = bi.position[1]
                    const xj = bj.position[0]
                    const yj = bj.position[1]

                    g.moveTo(xi, yi)
                    g.lineTo(xi + ri[0], yi + ri[1])

                    g.moveTo(xj, yj)
                    g.lineTo(xj + rj[0], yj + rj[1])
                }
            } else {
                graphics.contacts.clear()
            }
        },
        [pixiComponent, physicsWorldComponent, settingsComponent],
        STAGES.RENDER_CONTACTS
    )
    return null
}
