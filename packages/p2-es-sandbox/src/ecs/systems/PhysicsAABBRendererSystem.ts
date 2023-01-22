import { System } from 'arancini'
import { World } from 'p2-es'
import { PhysicsWorldComponent } from '../components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../components/singletons/PixiComponent'
import {
    Settings,
    SettingsComponent,
} from '../components/singletons/SettingsSingletonComponent'

const LINE_WIDTH = 0.01

export class PhysicsAABBRendererSystem extends System {
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

        if (settings.drawAABBs) {
            pixi.graphics.aabb.clear()
            pixi.container.removeChild(pixi.graphics.aabb)
            pixi.container.addChild(pixi.graphics.aabb)

            const g = pixi.graphics.aabb
            g.lineStyle(LINE_WIDTH, 0x000000, 1)

            for (let i = 0; i !== physicsWorld.bodies.length; i++) {
                const aabb = physicsWorld.bodies[i].getAABB()
                g.drawRect(
                    aabb.lowerBound[0],
                    aabb.lowerBound[1],
                    aabb.upperBound[0] - aabb.lowerBound[0],
                    aabb.upperBound[1] - aabb.lowerBound[1]
                )
            }
        } else {
            pixi.graphics.aabb.clear()
        }
    }
}
