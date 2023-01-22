import { Entity, System } from 'arancini'
import { Body, Spring, World } from 'p2-es'
import { PhysicsBodyComponent } from '../components/PhysicsBodyComponent'
import { PhysicsSpringComponent } from '../components/PhysicsSpringComponent'
import { PhysicsWorldComponent } from '../components/singletons/PhysicsWorldComponent'
import {
    Settings,
    SettingsComponent,
} from '../components/singletons/SettingsSingletonComponent'

export class PhysicsSystem extends System {
    queries = {
        physicsWorld: this.query({
            all: [PhysicsWorldComponent],
        }),
        settings: this.query([SettingsComponent]),
    }

    bodyEntities: Map<Body, Entity> = new Map()

    springEntities: Map<Spring, Entity> = new Map()

    get physicsWorld(): World | undefined {
        return this.queries.physicsWorld.first?.get(PhysicsWorldComponent)
            .physicsWorld
    }

    get settings(): Settings | undefined {
        return this.queries.settings.first?.get(SettingsComponent).settings
    }

    onInit() {
        const handleAddBody = (body: Body) => {
            const entity = this.world.create.entity([
                { type: PhysicsBodyComponent, args: [body] },
            ])

            this.bodyEntities.set(body, entity)
        }

        const handleRemoveBody = (body: Body) => {
            const entity = this.bodyEntities.get(body)
            entity?.destroy()
        }

        const handleAddSpring = (spring: Spring) => {
            const entity = this.world.create.entity([
                { type: PhysicsSpringComponent, args: [spring] },
            ])

            this.springEntities.set(spring, entity)
        }

        const handleRemoveSpring = (spring: Spring) => {
            const entity = this.springEntities.get(spring)
            entity?.destroy()
        }

        this.queries.physicsWorld.onEntityAdded.add((worldEntity) => {
            const { physicsWorld } = worldEntity.get(PhysicsWorldComponent)

            for (const body of physicsWorld.bodies) {
                handleAddBody(body)
            }

            for (const spring of physicsWorld.springs) {
                handleAddSpring(spring)
            }

            physicsWorld.on('addBody', ({ body }) => handleAddBody(body))

            physicsWorld.on('addSpring', ({ spring }) =>
                handleAddSpring(spring)
            )

            physicsWorld.on('removeBody', ({ body }) => handleRemoveBody(body))

            physicsWorld.on('removeSpring', ({ spring }) =>
                handleRemoveSpring(spring)
            )
        })
    }

    onUpdate(delta: number) {
        const { settings, physicsWorld: world } = this
        if (!settings || !world) return
        if (settings.paused) return

        world.step(settings.timeStep, delta, settings.maxSubSteps)
    }

    manualStep() {
        const { settings, physicsWorld: world } = this
        if (!settings || !world) return

        world.step(settings.timeStep, settings.timeStep)
    }
}
