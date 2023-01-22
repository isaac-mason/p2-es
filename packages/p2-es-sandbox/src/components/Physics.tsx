import * as p2 from 'p2-es'
import { useEffect } from 'react'
import { useECS } from '../context/ecsContext'
import { PhysicsBodyComponent } from '../ecs/components/PhysicsBodyComponent'
import { PhysicsSpringComponent } from '../ecs/components/PhysicsSpringComponent'
import { PhysicsWorldComponent } from '../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../ecs/components/singletons/PixiComponent'
import { UpdateHandlersComponent } from '../ecs/components/singletons/UpdateHandlersSingletonComponent'
import { useSingletonComponent } from '../hooks/useSingletonComponent'
import { SandboxFunction } from '../types'
import { sandboxFunctionEvaluator } from '../utils/sandboxFunctionEvaluator'

export type PhysicsProps = {
    sandboxFunction: SandboxFunction
}

export const Physics = ({ sandboxFunction }: PhysicsProps) => {
    const ecs = useECS()
    const pixi = useSingletonComponent(PixiComponent)

    useEffect(() => {
        if (!pixi) return

        const {
            world: physicsWorld,
            updateHandlers,
            sandboxContext,
            destroySandbox,
        } = sandboxFunctionEvaluator({ pixi, sandboxFunction })

        const physicsEntity = ecs.world.create.entity()
        physicsEntity.add(PhysicsWorldComponent, physicsWorld)
        physicsEntity.add(UpdateHandlersComponent, updateHandlers)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalWindow = window as any
        globalWindow.world = physicsWorld
        globalWindow.p2 = p2
        globalWindow.sandbox = sandboxContext

        return () => {
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
    }, [pixi])

    return null
}
