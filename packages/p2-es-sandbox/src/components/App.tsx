import { Entity } from 'arancini'
import * as p2 from 'p2-es'
import { Body, Spring } from 'p2-es'
import React, { useEffect, useRef, useState } from 'react'
import { PhysicsBodyComponent } from '../ecs/components/PhysicsBodyComponent'
import { PhysicsSpringComponent } from '../ecs/components/PhysicsSpringComponent'
import { PhysicsWorldComponent } from '../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../ecs/components/singletons/PixiComponent'
import { PointerComponent } from '../ecs/components/singletons/PointerComponent'
import {
    defaultSandboxSettings,
    SandboxSettings,
    SettingsComponent,
} from '../ecs/components/singletons/SettingsComponent'
import { createWorld } from '../ecs/createWorld'
import { WorldContextProvider } from '../ecs/worldContext'
import { useConst } from '../hooks/useConst'
import { useECS } from '../hooks/useECS'
import { useFrame } from '../hooks/useFrame'
import { useSingletonComponent } from '../hooks/useSingletonComponent'
import { STAGES } from '../stages'
import { SandboxFunction, Scenes, Tool, Tools } from '../types'
import { initPixi } from '../utils/pixi/initPixi'
import { sandboxFunctionEvaluator } from '../utils/sandboxFunctionEvaluator'
import {
    CanvasWrapper,
    ControlsWrapper,
    ExternalLink,
    Header,
    HeaderButton,
    HeaderButtons,
    HeaderMiddle,
    HeaderSandboxTitle,
    InspectorWrapper,
    Main,
    Wrapper,
} from './AppStyledComponents'
import { Controls } from './controls/Controls'
import { Inspector } from './inspector/Inspector'
import { Loop } from './Loop'
import { PhysicsAABBRenderer } from './pixi/PhysicsAABBRenderer'
import { PhysicsBodyRenderer } from './pixi/PhysicsBodyRenderer'
import { PhysicsContactRenderer } from './pixi/PhysicsContactRenderer'
import { PhysicsSpringRenderer } from './pixi/PhysicsSpringRenderer'
import { CodeSvg } from './svgs/CodeSvg'
import { ExternalLinkSvg } from './svgs/ExternalLinkSvg'
import { PencilSvg } from './svgs/PencilSvg'
import { RefreshSvg } from './svgs/RefreshSvg'
import { SearchSvg } from './svgs/SearchSvg'
import { CircleTool } from './tools/CircleTool'
import { PickPanTool } from './tools/PickPanTool'
import { PointerObserver } from './tools/PointerObserver'
import { PolygonTool } from './tools/PolygonTool'
import { RectangleTool } from './tools/RectangleTool'

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

export type AppProps = {
    setup: SandboxFunction | Scenes
    title?: string
    codeLink?: string
}

const AppInner = ({ title, setup, codeLink }: AppProps) => {
    const ecs = useECS()

    const canvasWrapperElement = useRef<HTMLDivElement>(null)

    /* state and function for resetting the current scene */
    const [sceneVersion, setSceneVersion] = useState(0)
    const resetScene = () => setSceneVersion((v) => v + 1)

    /* scene state */
    const scenes = typeof setup === 'function' ? { default: { setup } } : setup
    const sceneNames = Object.keys(scenes)
    const [scene, setScene] = useState(sceneNames[0])
    const previousScene = useRef<string | null>(null)

    /* current tool */
    const [tool, setTool] = useState<Tool>(Tools.PICK_PAN)

    /* controls and inspector visibility */
    const [searchParams] = useState(
        () => new URLSearchParams(window.location.search)
    )
    const [controlsHidden, setControlsHidden] = useState(() => {
        return searchParams.get('controls') === 'false'
    })
    const [inspectorHidden, setInspectorHidden] = useState(() => {
        return searchParams.get('inspector') !== 'true'
    })

    /* sandbox settings */
    const [sandboxSettings, setSandboxSettings] = useState<SandboxSettings>(
        defaultSandboxSettings
    )

    /* user-provided handlers for updating the sandbox */
    const [sandboxUpdateHandlers, setSandboxUpdateHandlers] = useState<Set<
        (delta: number) => void
    > | null>()

    const bodyEntities: Map<Body, Entity> = useConst(() => new Map())
    const springEntities: Map<Spring, Entity> = useConst(() => new Map())

    const pixi = useSingletonComponent(PixiComponent)
    const physicsWorld = useSingletonComponent(PhysicsWorldComponent)
    const pointer = useSingletonComponent(PointerComponent)
    const settings = useSingletonComponent(SettingsComponent)

    useEffect(() => {
        pixi?.onResize()
    }, [pixi?.id, controlsHidden])

    /* create the pixi application */
    useEffect(() => {
        const { destroyPixi, ...pixiObjects } = initPixi(
            canvasWrapperElement.current!
        )

        const pixiEntity = ecs.world.create.entity()
        pixiEntity.add(PixiComponent, pixiObjects)

        // eslint-disable-next-line no-console
        console.log(CONSOLE_MESSAGE)

        return () => {
            pixiEntity.destroy()
            destroyPixi()
        }
    }, [])

    /* create the current scene */
    useEffect(() => {
        if (!pixi || !pointer) return

        // evaluate the current scene's sandbox function
        const {
            world,
            tools,
            updateHandlers,
            sandboxContext,
            settings: newSandboxSettings,
            destroySandbox,
        } = sandboxFunctionEvaluator({
            pixi,
            pointer,
            sandboxFunction: scenes[scene].setup,
        })

        // set sandbox settings if the scene has changed
        if (scene !== previousScene.current) {
            const s = {
                ...defaultSandboxSettings,
                ...newSandboxSettings,
            }
            setSandboxSettings(s)
        }

        // set tool config
        if (tools?.default) {
            setTool(tools.default)
        }

        // create entities for existing physics bodies and springs
        const addBodyEntity = (body: Body) => {
            const entity = ecs.world.create.entity([
                { type: PhysicsBodyComponent, args: [body] },
            ])

            bodyEntities.set(body, entity)
        }

        const removeBodyEntity = (body: Body) => {
            const entity = bodyEntities.get(body)
            entity?.destroy()
        }

        const addSpringEntity = (spring: Spring) => {
            const entity = ecs.world.create.entity([
                { type: PhysicsSpringComponent, args: [spring] },
            ])

            springEntities.set(spring, entity)
        }

        const removeSpringRemoveSpringEntity = (spring: Spring) => {
            const entity = springEntities.get(spring)
            entity?.destroy()
        }

        for (const body of world.bodies) {
            addBodyEntity(body)
        }

        for (const spring of world.springs) {
            addSpringEntity(spring)
        }

        // add physics body and spring entities on world events
        const addBodyHandler = ({ body }: { body: Body }) => addBodyEntity(body)
        const removeBodyHandler = ({ body }: { body: Body }) =>
            removeBodyEntity(body)

        const addSpringHandler = ({ spring }: { spring: Spring }) =>
            addSpringEntity(spring)
        const removeSpringHandler = ({ spring }: { spring: Spring }) =>
            removeSpringRemoveSpringEntity(spring)

        world.on('addBody', addBodyHandler)
        world.on('addSpring', addSpringHandler)
        world.on('removeBody', removeBodyHandler)
        world.on('removeSpring', removeSpringHandler)

        // set the sandbox update handlers
        setSandboxUpdateHandlers(updateHandlers)

        // create singleton physics entity
        const physicsEntity = ecs.world.create.entity()
        physicsEntity.add(PhysicsWorldComponent, world)

        // set window globals
        const globalWindow = window as unknown as Record<string, unknown>
        globalWindow.world = world
        globalWindow.p2 = p2
        globalWindow.sandbox = sandboxContext

        return () => {
            previousScene.current = scene

            setSandboxUpdateHandlers(null)

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
    }, [pixi?.id, pointer?.id, scene, sceneVersion])

    /* step the physics world */
    useFrame((delta) => {
        if (!settings || !physicsWorld) return

        const { timeStep, maxSubSteps, paused } = settings
        const { world } = physicsWorld

        if (paused) return

        const clampedDelta = Math.min(delta, 1)
        world.step(timeStep, clampedDelta, maxSubSteps)
    }, STAGES.PHYSICS)

    /* sandbox update handlers */
    useFrame((delta) => {
        if (!sandboxUpdateHandlers) return

        sandboxUpdateHandlers.forEach((fn) => fn(delta))
    }, STAGES.SANDBOX_HANDLERS)

    return (
        <>
            {/* UI */}
            <Wrapper>
                <Header>
                    <a href="https://p2-es.pmnd.rs" target="_blank">
                        <ExternalLink>
                            p2-es
                            <ExternalLinkSvg />
                        </ExternalLink>
                    </a>

                    <HeaderMiddle>
                        {/* Title */}
                        <HeaderSandboxTitle>
                            {title}
                            {title && sceneNames.length > 1 ? ' - ' : ''}
                            {scene !== 'default' ? scene : ''}
                        </HeaderSandboxTitle>

                        <HeaderButtons>
                            {/* Reset */}
                            <HeaderButton title="Reset">
                                <button onClick={() => resetScene()}>
                                    <RefreshSvg />
                                </button>
                            </HeaderButton>

                            {/* Toggle inspector */}
                            <HeaderButton title="World Inspector">
                                <button
                                    onClick={() =>
                                        setInspectorHidden(
                                            (current) => !current
                                        )
                                    }
                                >
                                    <SearchSvg />
                                </button>
                            </HeaderButton>

                            {/* Toggle controls */}
                            <HeaderButton title="Controls">
                                <button
                                    onClick={() =>
                                        setControlsHidden((current) => !current)
                                    }
                                >
                                    <PencilSvg />
                                </button>
                            </HeaderButton>

                            {/* Link to source code */}
                            {codeLink !== undefined ? (
                                <HeaderButton title="Sandbox Source Code">
                                    <a href={codeLink} target="_blank">
                                        <CodeSvg />
                                    </a>
                                </HeaderButton>
                            ) : null}
                        </HeaderButtons>
                    </HeaderMiddle>

                    <a href="https://p2-es.pmnd.rs/docs" target="_blank">
                        <ExternalLink>
                            docs
                            <ExternalLinkSvg />
                        </ExternalLink>
                    </a>
                </Header>
                <Main>
                    {/* Pixi Canvas */}
                    <CanvasWrapper
                        ref={canvasWrapperElement}
                        controlsHidden={controlsHidden}
                    />

                    {/* Controls */}
                    <ControlsWrapper hide={controlsHidden}>
                        <Controls
                            hidden={controlsHidden}
                            tool={tool}
                            setTool={(t) => setTool(t)}
                            scene={scene}
                            scenes={sceneNames}
                            setScene={(sceneName) => setScene(sceneName)}
                            defaultSettings={sandboxSettings}
                            reset={resetScene}
                        />
                    </ControlsWrapper>
                </Main>
            </Wrapper>

            {/* World Inspector */}
            <InspectorWrapper>
                <Inspector hidden={inspectorHidden} />
            </InspectorWrapper>

            {/* Tools */}
            <PointerObserver />
            {tool === Tools.PICK_PAN && <PickPanTool />}
            {tool === Tools.POLYGON && <PolygonTool />}
            {tool === Tools.CIRCLE && <CircleTool />}
            {tool === Tools.RECTANGLE && <RectangleTool />}

            {/* Pixi */}
            <PhysicsBodyRenderer />
            <PhysicsContactRenderer />
            <PhysicsSpringRenderer />
            <PhysicsAABBRenderer />

            {/* Update loop */}
            <Loop />
        </>
    )
}

export const App = (props: AppProps) => {
    const world = useConst(() => createWorld())

    return (
        <React.StrictMode>
            <WorldContextProvider world={world}>
                <AppInner {...props} />
            </WorldContextProvider>
        </React.StrictMode>
    )
}
