import { System } from 'arancini'
import { World } from 'p2-es'
import { PhysicsWorldComponent } from '../components/PhysicsWorldComponent'
import { PixiComponent } from '../components/PixiComponent'
import { Settings, SettingsComponent } from '../components/SettingsComponent'

const LINE_WIDTH = 0.01

export class PhysicsContactsRendererSystem extends System {
    queries = {
        pixi: this.query([PixiComponent]),
        physicsWorld: this.query([PhysicsWorldComponent]),
        settings: this.query([SettingsComponent]),
    }

    get physicsWorld(): World | undefined {
        return this.queries.physicsWorld.first?.get(PhysicsWorldComponent)
            .physicsWorld
    }

    get pixi(): PixiComponent | undefined {
        return this.queries.pixi.first?.find(PixiComponent)
    }

    get settings(): Settings | undefined {
        return this.queries.settings.first?.find(SettingsComponent)?.settings
    }

    onUpdate() {
        const { settings, pixi, physicsWorld } = this
        if (!settings || !pixi || !physicsWorld) return

        // Draw contacts
        if (settings.drawContacts) {
            pixi.graphics.contacts.clear()
            pixi.container.removeChild(pixi.graphics.contacts)
            pixi.container.addChild(pixi.graphics.contacts)

            const g = pixi.graphics.contacts
            g.lineStyle(LINE_WIDTH, 0x000000, 1)
            for (
                let i = 0;
                i !== physicsWorld.narrowphase.contactEquations.length;
                i++
            ) {
                const eq = physicsWorld.narrowphase.contactEquations[i]
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
            pixi.graphics.contacts.clear()
        }
    }
}
