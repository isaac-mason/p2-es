import { Entity } from 'arancini'
import * as p2 from 'p2-es'
import { Body, Spring } from 'p2-es'
import React, { useEffect, useRef, useState } from 'react'
import { up } from 'styled-breakpoints'
import styled from 'styled-components'
import { PhysicsBodyComponent } from '../ecs/components/PhysicsBodyComponent'
import { PhysicsSpringComponent } from '../ecs/components/PhysicsSpringComponent'
import { PhysicsWorldComponent } from '../ecs/components/singletons/PhysicsWorldComponent'
import { PixiComponent } from '../ecs/components/singletons/PixiComponent'
import { PointerComponent } from '../ecs/components/singletons/PointerComponent'
import { SettingsComponent } from '../ecs/components/singletons/SettingsSingletonComponent'
import { createWorld } from '../ecs/createWorld'
import { WorldContextProvider } from '../ecs/worldContext'
import { useConst } from '../hooks/useConst'
import { useECS } from '../hooks/useECS'
import { useFrame } from '../hooks/useFrame'
import { useSingletonComponent } from '../hooks/useSingletonComponent'
import { STAGES } from '../stages'
import { color } from '../theme/color'
import { SandboxFunction, Scenes, Tool, Tools } from '../types'
import { initPixi } from '../utils/pixi/initPixi'
import { sandboxFunctionEvaluator } from '../utils/sandboxFunctionEvaluator'
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

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    width: 100%;

    ${up('md')} {
        height: 100%;
    }
`

const HEADER_HEIGHT = '50px'

const Header = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    width: calc(100% - 30px);
    height: ${HEADER_HEIGHT};
    padding: 0 15px;
    border-bottom: 1px solid ${color.backgroundLight};
    background-color: ${color.background};
    color: ${color.highlight1};

    font-size: 0.9rem;
    font-family: 'Roboto Mono', monospace;

    a {
        color: ${color.highlight1};
        text-decoration: none;
    }

    overflow-x: auto;

    ${up('md')} {
        overflow-x: hidden;
    }
`

const ExternalLink = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 0.2em;

    svg {
        width: 15px;
        stroke: ${color.highlight1};
    }
`

const HeaderButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 30px;

    text-align: center;

    background-color: ${color.background};
    &:hover {
        background-color: ${color.backgroundLight};
    }

    * {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${color.highlight1};
        font-weight: 400;
    }

    button {
        background: none;
        border: none;
        padding: 0;
        width: 35px;
    }

    svg {
        width: 20px;
        height: 20px;
        stroke: #efefef;
    }
`

const HeaderButtons = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
`

const HeaderMiddle = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-evenly;
    gap: 2em;
`

const HeaderSandboxTitle = styled.div`
    display: none;

    ${up('md')} {
        display: block;
    }
`

const Main = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    ${up('md')} {
        height: 100%;
        flex-direction: row;
        overflow: hidden;
    }
`

const CanvasWrapper = styled.div<{ controlsHidden: boolean }>`
    flex: 1;
    width: 100%;

    min-height: ${({ controlsHidden }) =>
        controlsHidden ? `calc(100vh - ${HEADER_HEIGHT})` : '70vh'};
    max-height: ${({ controlsHidden }) =>
        controlsHidden ? `calc(100vh - ${HEADER_HEIGHT})` : '70vh'};

    height: 100%;

    ${up('md')} {
        min-height: unset;
        max-height: unset;
        height: 100%;
    }
`

const ControlsWrapper = styled.div<{ hidden: boolean }>`
    flex: 1;
    width: 100%;
    min-height: 300px;
    background-color: ${color.background};

    ${up('md')} {
        flex: none;
        width: 320px;
        height: 100%;
        min-height: unset;
        overflow-y: scroll;
    }
`

const InspectorWrapper = styled.div`
    position: absolute;
    width: 300px;
    top: 4em;
    left: 1em;

    ${up('md')} {
        width: 320px;
    }
`

export type AppProps = {
    setup: SandboxFunction | Scenes

    title?: string

    codeLink?: string
}

const AppInner = ({ title, setup, codeLink }: AppProps) => {
    const [version, setVersion] = useState(0)
    const reset = () => setVersion((v) => v + 1)

    const ecs = useECS()

    const canvasWrapperElement = useRef<HTMLDivElement>(null)

    const scenes = typeof setup === 'function' ? { default: { setup } } : setup
    const sceneNames = Object.keys(scenes)
    const [scene, setScene] = useState(sceneNames[0])

    const [tool, setTool] = useState<Tool>(Tools.PICK_PAN)

    const [controlsHidden, setControlsHidden] = useState(false)
    const [inspectorHidden, setInspectorHidden] = useState(true)

    const [sandboxUpdateHandlers, setSandboxUpdateHandlers] = useState<Set<
        (delta: number) => void
    > | null>()

    const bodyEntities: Map<Body, Entity> = useConst(() => new Map())
    const springEntities: Map<Spring, Entity> = useConst(() => new Map())

    const pixiComponent = useSingletonComponent(PixiComponent)
    const settingsComponent = useSingletonComponent(SettingsComponent)
    const physicsWorldComponent = useSingletonComponent(PhysicsWorldComponent)
    const pointerComponent = useSingletonComponent(PointerComponent)

    useEffect(() => {
        if (!pixiComponent) return
        pixiComponent.onResize()
    }, [pixiComponent, controlsHidden])

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

    /* create the current scene */
    useEffect(() => {
        if (!pixiComponent || !settingsComponent || !pointerComponent) return

        // evaluate the current scene's sandbox function
        const { world, tools, updateHandlers, sandboxContext, destroySandbox } =
            sandboxFunctionEvaluator({
                pixi: pixiComponent,
                pointer: pointerComponent,
                sandboxFunction: scenes[scene].setup,
            })

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
    }, [pixiComponent, settingsComponent, pointerComponent, scene, version])

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

    /* sandbox update handlers */
    useFrame(
        (delta) => {
            if (!sandboxUpdateHandlers) return

            sandboxUpdateHandlers.forEach((fn) => fn(delta))
        },
        [sandboxUpdateHandlers],
        STAGES.SANDBOX_HANDLERS
    )

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
                                <button onClick={() => reset()}>
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
                    <ControlsWrapper hidden={controlsHidden}>
                        <Controls
                            tool={tool}
                            setTool={(t) => setTool(t)}
                            scene={scene}
                            scenes={sceneNames}
                            setScene={(sceneName) => setScene(sceneName)}
                            reset={reset}
                        />
                    </ControlsWrapper>
                </Main>
            </Wrapper>

            {/* World Inspector */}
            <InspectorWrapper>
                <Inspector hidden={inspectorHidden} />
            </InspectorWrapper>

            {/* Interaction */}
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
