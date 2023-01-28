import { Entity } from 'arancini'
import * as p2 from 'p2-es'
import { Body, Spring } from 'p2-es'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { up } from 'styled-breakpoints'
import styled from 'styled-components'
import { PhysicsBodyComponent } from '../ecs/components/PhysicsBodyComponent'
import { PhysicsSpringComponent } from '../ecs/components/PhysicsSpringComponent'
import { PhysicsWorldComponent } from '../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../ecs/components/singletons/PixiComponent'
import { SettingsComponent } from '../ecs/components/singletons/SettingsSingletonComponent'
import { createWorld } from '../ecs/createWorld'
import { WorldContextProvider } from '../ecs/worldContext'
import { useConst } from '../hooks/useConst'
import { useECS } from '../hooks/useECS'
import { useFrame } from '../hooks/useFrame'
import { useSingletonComponent } from '../hooks/useSingletonComponent'
import { STAGES } from '../stages'
import { SandboxFunction, Tool, Tools } from '../types'
import { initPixi } from '../utils/pixi/initPixi'
import { sandboxFunctionEvaluator } from '../utils/sandboxFunctionEvaluator'
import { Controls } from './controls/Controls'
import { Loop } from './Loop'
import { PhysicsAABBRenderer } from './pixi/PhysicsAABBRenderer'
import { PhysicsBodyRenderer } from './pixi/PhysicsBodyRenderer'
import { PhysicsContactRenderer } from './pixi/PhysicsContactRenderer'
import { PhysicsSpringRenderer } from './pixi/PhysicsSpringRenderer'

const CONSOLE_MESSAGE = `
=== p2-es ===
Welcome to the p2-es sandbox environment!
Did you know you can interact with the physics world here in the console? Try executing the following:

/* set world gravity */
world.gravity[1] = 10;

/* add a body */
const body = new p2.Body({
    mass: 1,
});

body.addShape(new p2.Circle({
    radius: 1,
}));

world.addBody(body);
`

export type SandboxSetup =
    | SandboxFunction
    | Record<string, { setup: SandboxFunction }>

export type SandboxProps = {
    setup: SandboxSetup

    title?: string

    /**
     * @default true
     */
    controls?: boolean
}

const SandboxWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #fff;
`

const SandboxHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    width: calc(100% - 30px);
    height: 40px;
    padding: 0 15px;
    border-bottom: 1px solid #333;
    background-color: #181c20;
    color: #fff;

    font-size: 0.9rem;
    font-family: 'Roboto Mono', monospace;
`

const SandboxMain = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    height: 100%;

    ${up('md')} {
        flex-direction: row;
        overflow: hidden;
    }
`

const SandboxCanvasWrapper = styled.div`
    flex: none;
    height: calc(100vh - 10em);
    width: 100%;

    ${up('md')} {
        flex: 1;
        height: 100%;
    }
`

const SandboxInner = ({
    title = 'p2-es sandbox',
    controls = true,
    setup,
}: SandboxProps) => {
    const ecs = useECS()

    const canvasWrapperElement = useRef<HTMLDivElement>(null)

    const scenes = useMemo(
        () => (typeof setup === 'function' ? { default: { setup } } : setup),
        [setup]
    )
    const sceneNames = useMemo(() => Object.keys(scenes), [scenes])
    const [currentScene, setCurrentScene] = useState(sceneNames[0])
    const [version, setVersion] = useState(0)

    const sandboxFunction = scenes[currentScene].setup

    const [tool, setTool] = useState<Tool>(Tools.PICK_PAN)

    const pixiComponent = useSingletonComponent(PixiComponent)
    const settingsComponent = useSingletonComponent(SettingsComponent)
    const physicsWorldComponent = useSingletonComponent(PhysicsWorldComponent)

    const [sandboxUpdate, setSandboxUpdate] = useState<Set<
        (delta: number) => void
    > | null>()

    const bodyEntities: Map<Body, Entity> = useConst(() => new Map())
    const springEntities: Map<Spring, Entity> = useConst(() => new Map())

    /* create the pixi application */
    useEffect(() => {
        const { destroyPixi, ...pixi } = initPixi(canvasWrapperElement.current!)
        const pixiEntity = ecs.world.create.entity()
        pixiEntity.add(PixiComponent, pixi)

        // eslint-disable-next-line no-console
        console.log(CONSOLE_MESSAGE)

        return () => {
            pixiEntity.destroy()
            destroyPixi()
        }
    }, [])

    /* evaluate the current scene's sandbox function */
    useEffect(() => {
        if (!pixiComponent || !settingsComponent) return

        const {
            world,
            defaultTool,
            sandboxUpdateHandlers,
            sandboxContext,
            destroySandbox,
        } = sandboxFunctionEvaluator({ pixi: pixiComponent, sandboxFunction })

        if (defaultTool) {
            setTool(defaultTool)
        }

        const physicsEntity = ecs.world.create.entity()
        physicsEntity.add(PhysicsWorldComponent, world)

        const globalWindow = window as unknown as Record<string, unknown>
        globalWindow.world = world
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

        for (const body of world.bodies) {
            addBody(body)
        }

        for (const spring of world.springs) {
            addSpring(spring)
        }

        const addBodyHandler = ({ body }: { body: Body }) => addBody(body)
        world.on('addBody', addBodyHandler)

        const addSpringHandler = ({ spring }: { spring: Spring }) =>
            addSpring(spring)
        world.on('addSpring', addSpringHandler)

        const removeBodyHandler = ({ body }: { body: Body }) => removeBody(body)
        world.on('removeBody', removeBodyHandler)

        const removeSpringHandler = ({ spring }: { spring: Spring }) =>
            removeSpring(spring)
        world.on('removeSpring', removeSpringHandler)

        setSandboxUpdate(sandboxUpdateHandlers)

        return () => {
            setSandboxUpdate(null)

            world.off('addBody', addBodyHandler)
            world.off('addSpring', addSpringHandler)
            world.off('removeBody', removeBodyHandler)
            world.off('removeSpring', removeSpringHandler)

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
    }, [pixiComponent, settingsComponent, currentScene, version])

    /* step the physics world */
    useFrame(
        (delta) => {
            if (!settingsComponent || !physicsWorldComponent) return

            const {
                settings: { timeStep, maxSubSteps, paused },
            } = settingsComponent

            const { world } = physicsWorldComponent

            if (paused) return

            world.step(timeStep, delta, maxSubSteps)
        },
        [settingsComponent, physicsWorldComponent],
        STAGES.PHYSICS
    )

    /* run sandbox update handlers */
    useFrame(
        (delta) => {
            if (!sandboxUpdate) return

            sandboxUpdate.forEach((fn) => fn(delta))
        },
        [sandboxUpdate],
        STAGES.SANDBOX_HANDLERS
    )

    return (
        <>
            <SandboxWrapper>
                <SandboxHeader>
                    {title} {sceneNames.length > 1 ? ` - ${currentScene}` : ''}
                </SandboxHeader>
                <SandboxMain>
                    <SandboxCanvasWrapper ref={canvasWrapperElement} />

                    {controls ? (
                        <Controls
                            tool={tool}
                            setTool={(t) => setTool(t)}
                            currentScene={currentScene}
                            scenes={sceneNames}
                            setScene={(sceneName) => setCurrentScene(sceneName)}
                            reset={() => setVersion((v) => v + 1)}
                        />
                    ) : null}
                </SandboxMain>
            </SandboxWrapper>

            <PhysicsBodyRenderer />
            <PhysicsContactRenderer />
            <PhysicsSpringRenderer />
            <PhysicsAABBRenderer />

            <Loop />
        </>
    )
}

export const Sandbox = (props: SandboxProps) => {
    const world = useConst(() => createWorld())

    return (
        <React.StrictMode>
            <WorldContextProvider world={world}>
                <SandboxInner {...props} />
            </WorldContextProvider>
        </React.StrictMode>
    )
}
