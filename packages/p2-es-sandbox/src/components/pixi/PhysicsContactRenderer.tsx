import { PhysicsWorldComponent } from '../../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { SettingsComponent } from '../../ecs/components/singletons/SettingsComponent'
import { useFrame } from '../../hooks/useFrame'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { STAGES } from '../../stages'
import { canvasTheme } from '../../theme/canvasTheme'

export const PhysicsContactRenderer = () => {
    const pixi = useSingletonComponent(PixiComponent)
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)
    const settings = useSingletonComponent(SettingsComponent)

    useFrame(
        () => {
            if (!settings || !pixi || !physicsWorld) return

            const { drawContacts } = settings
            const { graphics, container } = pixi
            const { world } = physicsWorld

            // Draw contacts
            if (drawContacts) {
                graphics.contacts.clear()
                container.removeChild(graphics.contacts)
                container.addChild(graphics.contacts)

                const g = graphics.contacts
                g.lineStyle(canvasTheme.lineWidth, 0x000000, 1)
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
        [pixi?.id, physicsWorld?.id, settings?.id],
        STAGES.RENDER_CONTACTS
    )
    return null
}
