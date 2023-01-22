import * as p2 from 'p2-es'
import React, { useEffect, useRef, useState } from 'react'
import { up } from 'styled-breakpoints'
import styled from 'styled-components'
import { EcsContextProvider } from '../context/ecsContext'
import { PhysicsBodyComponent } from '../ecs/components/PhysicsBodyComponent'
import { PhysicsSpringComponent } from '../ecs/components/PhysicsSpringComponent'
import { PhysicsWorldComponent } from '../ecs/components/PhysicsWorldComponent'
import { PixiComponent } from '../ecs/components/PixiComponent'
import { SandboxContextComponent } from '../ecs/components/SandboxContextComponent'
import { createECS } from '../ecs/createECS'
import { useConst } from '../hooks/useConst'
import { initPixi } from '../pixi/initPixi'
import { SandboxFunction } from '../types'
import { loop } from '../utils/loop'
import { sandboxFunctionEvaluator } from '../utils/sandboxFunctionEvaluator'
import { Controls } from './Controls'
import { Mouse } from './Mouse'
import { Zoom } from './Zoom'

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

export type SandboxProps = {
    sandboxFunction: SandboxFunction

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
    height: calc(100% - 10em);
    width: 100%;

    ${up('md')} {
        flex: 1;
        height: 100%;
    }
`

export const Sandbox = ({
    title = 'p2-es sandbox',
    controls = true,
    sandboxFunction,
}: SandboxProps) => {
    const ecs = useConst(() => createECS())

    const { world } = ecs

    const canvasWrapperElement = useRef<HTMLDivElement>(null)

    const [version, setVersion] = useState(0)

    useEffect(() => {
        const {
            renderer,
            stage,
            container,
            graphics,
            background,
            canvasElement,
            destroyPixi,
        } = initPixi(canvasWrapperElement.current!)

        const pixi = {
            renderer,
            stage,
            container,
            graphics,
            background,
            canvasElement,
        }

        const {
            world: physicsWorld,
            updateHandlers,
            sandboxContext,
            destroySandbox,
        } = sandboxFunctionEvaluator({ pixi, sandboxFunction })

        const pixiEntity = world.create.entity()
        pixiEntity.add(PixiComponent, pixi)

        const sandboxContextEntity = world.create.entity()
        sandboxContextEntity.add(SandboxContextComponent, sandboxContext)

        const physicsWorldEntity = world.create.entity()
        physicsWorldEntity.add(PhysicsWorldComponent, physicsWorld)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const globalWindow = window as any
        globalWindow.world = physicsWorld
        globalWindow.p2 = p2
        globalWindow.sandbox = sandboxContext

        // eslint-disable-next-line no-console
        console.log(CONSOLE_MESSAGE)

        const stopLoop = loop((delta) => {
            world.update(delta)
            updateHandlers.forEach((handler) => handler(delta))
        })

        return () => {
            stopLoop()
            destroyPixi()
            destroySandbox()

            const entities = [
                pixiEntity,
                physicsWorldEntity,
                sandboxContextEntity,
                ...world.query([PhysicsBodyComponent]),
                ...world.query([PhysicsSpringComponent]),
            ]
            entities.forEach((entity) => {
                entity.destroy()
            })
        }
    }, [version])

    return (
        <React.StrictMode>
            <EcsContextProvider ecs={ecs}>
                <SandboxWrapper>
                    <SandboxHeader>{title}</SandboxHeader>
                    <SandboxMain>
                        <SandboxCanvasWrapper ref={canvasWrapperElement} />

                        {controls ? (
                            <Controls reset={() => setVersion((v) => v + 1)} />
                        ) : null}
                    </SandboxMain>
                </SandboxWrapper>

                <Mouse />
                <Zoom />
            </EcsContextProvider>
        </React.StrictMode>
    )
}
