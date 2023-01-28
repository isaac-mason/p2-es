import { button, Leva, LevaPanel, useControls } from 'leva'
import { ButtonInput } from 'leva/dist/declarations/src/types'
import React, { useEffect, useMemo } from 'react'
import { up } from 'styled-breakpoints'
import styled from 'styled-components'
import { PhysicsWorldComponent } from '../../ecs/components/singletons/PhysicsWorldComponent'
import {
    Settings,
    SettingsComponent,
} from '../../ecs/components/singletons/SettingsSingletonComponent'
import { useECS } from '../../hooks/useECS'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { Tool, Tools } from '../../types'
import { CircleTool } from './CircleTool'
import { PickPanTool } from './PickPanTool'
import { PolygonTool } from './PolygonTool'
import { RectangleTool } from './RectangleTool'

const ControlsWrapper = styled.div`
    padding: 5px;
    background: #181c20;
    width: calc(100% - 10px);

    ${up('md')} {
        width: 320px;
        overflow-y: auto;
    }
`

const defaultSettings = {
    physicsStepsPerSecond: 60,
    maxSubSteps: 3,
    paused: false,
    useInterpolatedPositions: true,
    drawContacts: false,
    drawAABBs: false,
    debugPolygons: false,
}

const useButtonGroupControls = (
    name: string,
    {
        options,
        current,
        onChange,
        hidden,
    }: {
        options: { name: string; value: string }[]
        current: string
        onChange: (value: string) => void
        hidden?: boolean
    }
) => {
    return useControls(
        name,
        () =>
            hidden
                ? {}
                : options.reduce<Record<string, ButtonInput>>((tools, t) => {
                      tools[t.name] = button(
                          () => {
                              onChange(t.value)
                          },
                          {
                              disabled: t.value === current,
                          }
                      )
                      return tools
                  }, {}),
        [current, options, hidden]
    )
}

export type ControlsProps = {
    currentScene: string
    tool: Tool
    setTool: (tool: Tool) => void
    scenes: string[]
    setScene: (scene: string) => void
    reset: () => void
}

export const Controls = ({
    currentScene,
    scenes,
    setScene,
    tool,
    setTool,
    reset,
}: ControlsProps) => {
    const ecs = useECS()

    const physicsWorldComponent = useSingletonComponent(PhysicsWorldComponent)

    useButtonGroupControls('Scene', {
        options: scenes.map((scene) => ({ name: scene, value: scene })),
        current: currentScene,
        onChange: setScene,
        hidden: scenes.length === 1,
    })

    useButtonGroupControls('Tool', {
        options: [
            { name: 'Pick/Pan [q]', value: Tools.PICK_PAN },
            { name: 'Polygon [d]', value: Tools.POLYGON },
            { name: 'Circle [a]', value: Tools.CIRCLE },
            { name: 'Rectangle [f]', value: Tools.RECTANGLE },
        ],
        current: tool,
        onChange: setTool,
    })

    const [
        {
            physicsStepsPerSecond,
            maxSubSteps,
            paused,
            useInterpolatedPositions,
        },
        setPhysics,
    ] = useControls('Physics', () => ({
        paused: {
            label: 'Paused [p]',
            value: defaultSettings.paused,
        },
        physicsStepsPerSecond: {
            label: 'Steps per second',
            value: defaultSettings.physicsStepsPerSecond,
        },
        maxSubSteps: {
            label: 'Max sub steps',
            value: defaultSettings.maxSubSteps,
        },
        useInterpolatedPositions: {
            label: 'Interpolated positions',
            value: defaultSettings.useInterpolatedPositions,
        },
    }))

    const timeStep = 1 / physicsStepsPerSecond

    const manualStep = () => {
        if (!physicsWorldComponent) return

        const { world } = physicsWorldComponent

        setPhysics({ paused: true })
        world.step(timeStep, timeStep)
    }

    useControls(
        'Actions',
        {
            'Manual Step [s]': button(() => {
                manualStep()
            }),
            'Reset [r]': button(() => {
                reset()
            }),
        },
        [physicsWorldComponent, timeStep, reset]
    )

    const [{ drawContacts, drawAABBs, debugPolygons }, setRendering] =
        useControls('Rendering', () => ({
            drawContacts: {
                label: 'Draw contacts [c]',
                value: defaultSettings.drawContacts,
            },
            drawAABBs: {
                label: 'Draw AABBs [t]',
                value: defaultSettings.drawAABBs,
            },
            debugPolygons: {
                label: 'Debug polygons',
                value: defaultSettings.debugPolygons,
            },
        }))

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase()

            if (key === 'q') {
                return setTool(Tools.PICK_PAN)
            }

            if (key === 'd') {
                return setTool(Tools.POLYGON)
            }

            if (key === 'a') {
                return setTool(Tools.CIRCLE)
            }

            if (key === 'f') {
                return setTool(Tools.RECTANGLE)
            }

            if (key === 'p' || key === ' ') {
                return setPhysics({ paused: !paused })
            }

            if (key === 'c') {
                return setRendering({ drawContacts: !drawContacts })
            }

            if (key === 't') {
                return setRendering({ drawAABBs: !drawAABBs })
            }

            if (key === 's') {
                return manualStep()
            }

            if (key === 'r') {
                return reset()
            }
        }

        window.addEventListener('keydown', handler)
        return () => {
            window.removeEventListener('keydown', handler)
        }
    }, [physicsWorldComponent, paused, drawContacts, drawAABBs, reset])

    const args: [Settings] = useMemo(
        () => [
            {
                timeStep,
                maxSubSteps,
                paused,
                useInterpolatedPositions,
                drawContacts,
                drawAABBs,
                debugPolygons,
            },
        ],
        [
            timeStep,
            maxSubSteps,
            paused,
            useInterpolatedPositions,
            drawContacts,
            drawAABBs,
            debugPolygons,
        ]
    )
    return (
        <>
            <ControlsWrapper>
                <Leva
                    fill
                    flat
                    titleBar={false}
                    theme={{
                        sizes: {
                            controlWidth: '110px',
                        },
                        colors: {
                            highlight1: '#ccc',
                            highlight2: '#ddd',
                        },
                    }}
                />
                <LevaPanel />
            </ControlsWrapper>

            {tool === Tools.PICK_PAN && <PickPanTool />}
            {tool === Tools.POLYGON && <PolygonTool />}
            {tool === Tools.CIRCLE && <CircleTool />}
            {tool === Tools.RECTANGLE && <RectangleTool />}

            <ecs.Entity>
                <ecs.Component type={SettingsComponent} args={args} />
            </ecs.Entity>
        </>
    )
}
