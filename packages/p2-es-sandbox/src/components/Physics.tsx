import { Entity } from 'arancini'
import * as p2 from 'p2-es'
import { Body, Spring } from 'p2-es'
import { useEffect, useState } from 'react'
import { useECS } from '../context/ecsContext'
import { PhysicsBodyComponent } from '../ecs/components/PhysicsBodyComponent'
import { PhysicsSpringComponent } from '../ecs/components/PhysicsSpringComponent'
import { PhysicsWorldComponent } from '../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../ecs/components/singletons/PixiComponent'
import { SettingsComponent } from '../ecs/components/singletons/SettingsSingletonComponent'
import { useConst } from '../hooks/useConst'
import { useFrame } from '../hooks/useFrame'
import { useSingletonComponent } from '../hooks/useSingletonComponent'
import { SCHEDULE } from '../schedule'
import { SandboxFunction } from '../types'
import { sandboxFunctionEvaluator } from '../utils/sandboxFunctionEvaluator'

export type PhysicsProps = {
    sandboxFunction: SandboxFunction
}

export const Physics = ({ sandboxFunction }: PhysicsProps) => {
    const ecs = useECS()

    const pixiComponent = useSingletonComponent(PixiComponent)
    const settingsComponent = useSingletonComponent(SettingsComponent)
    const physicsWorldComponent = useSingletonComponent(PhysicsWorldComponent)

    const [sandboxUpdate, setSandboxUpdate] = useState<Set<
        (delta: number) => void
    > | null>()

    const bodyEntities: Map<Body, Entity> = useConst(() => new Map())
    const springEntities: Map<Spring, Entity> = useConst(() => new Map())

    useEffect(() => {
        if (!pixiComponent || !settingsComponent) return

        const {
            world: physicsWorld,
            sandboxUpdateHandlers,
            sandboxContext,
            destroySandbox,
        } = sandboxFunctionEvaluator({ pixi: pixiComponent, sandboxFunction })

        const physicsEntity = ecs.world.create.entity()
        physicsEntity.add(PhysicsWorldComponent, physicsWorld)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalWindow = window as any
        globalWindow.world = physicsWorld
        globalWindow.p2 = p2
        globalWindow.sandbox = sandboxContext

        const addBody = (body: Body) => {
            const entity = ecs.world.create.entity([
                { type: PhysicsBodyComponent, args: [body] },
            ])

            bodyEntities.set(body, entity)
        }

        const removeBody = (body: Body) => {
            const entity = bodyEntities.get(body)
            entity?.destroy()
        }

        const addSpring = (spring: Spring) => {
            const entity = ecs.world.create.entity([
                { type: PhysicsSpringComponent, args: [spring] },
            ])

            springEntities.set(spring, entity)
        }

        const removeSpring = (spring: Spring) => {
            const entity = springEntities.get(spring)
            entity?.destroy()
        }

        for (const body of physicsWorld.bodies) {
            addBody(body)
        }

        for (const spring of physicsWorld.springs) {
            addSpring(spring)
        }

        const addBodyHandler = ({ body }: { body: Body }) => addBody(body)
        physicsWorld.on('addBody', addBodyHandler)

        const addSpringHandler = ({ spring }: { spring: Spring }) =>
            addSpring(spring)
        physicsWorld.on('addSpring', addSpringHandler)

        const removeBodyHandler = ({ body }: { body: Body }) => removeBody(body)
        physicsWorld.on('removeBody', removeBodyHandler)

        const removeSpringHandler = ({ spring }: { spring: Spring }) =>
            removeSpring(spring)
        physicsWorld.on('removeSpring', removeSpringHandler)

        setSandboxUpdate(sandboxUpdateHandlers)

        return () => {
            setSandboxUpdate(null)

            physicsWorld.off('addBody', addBodyHandler)
            physicsWorld.off('addSpring', addSpringHandler)
            physicsWorld.off('removeBody', removeBodyHandler)
            physicsWorld.off('removeSpring', removeSpringHandler)

            destroySandbox()

            const entities = [
                physicsEntity,
                ...ecs.world.query([PhysicsBodyComponent]),
                ...ecs.world.query([PhysicsSpringComponent]),
            ]

            entities.forEach((entity) => {
                entity.destroy()
            })
        }
    }, [pixiComponent, settingsComponent])

    useFrame(
        (delta) => {
            if (!settingsComponent || !physicsWorldComponent) return

            const {
                settings: { timeStep, maxSubSteps, paused },
            } = settingsComponent

            const { physicsWorld: world } = physicsWorldComponent

            if (paused) return

            world.step(timeStep, delta, maxSubSteps)
        },
        [settingsComponent, physicsWorldComponent],
        SCHEDULE.PHYSICS
    )

    useFrame(
        (delta) => {
            if (!sandboxUpdate) return

            sandboxUpdate.forEach((fn) => fn(delta))
        },
        [sandboxUpdate],
        SCHEDULE.SANDBOX_HANDLERS
    )

    return null
}
