import { button, Leva, LevaPanel, useControls } from 'leva'
import { ButtonInput } from 'leva/dist/declarations/src/types'
import React, { useEffect, useState } from 'react'
import { up } from 'styled-breakpoints'
import styled from 'styled-components'
import { PhysicsWorldComponent } from '../../ecs/components/singletons/PhysicsWorldComponent'
import { SettingsComponent } from '../../ecs/components/singletons/SettingsSingletonComponent'
import { useECS } from '../../hooks/useECS'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { Tool, Tools } from '../../types'
import { MouseObserver } from './MouseObserver'
import { PickPanTool } from './PickPanTool'

const ControlsWrapper = styled.div`
    padding: 5px;
    background: #181c20;
    width: calc(100% - 10px);

    ${up('md')} {
        width: 320px;
        overflow-y: auto;
    }
`

const defaultPhysicsStepsPerSecond = 60

export const defaultSettings = {
    physicsStepsPerSecond: defaultPhysicsStepsPerSecond,
    maxSubSteps: 3,
    paused: false,
    useInterpolatedPositions: true,
    drawContacts: false,
    drawAABBs: false,
    debugPolygons: false,
}

export type ControlsProps = {
    currentScene: string
    scenes: string[]
    setScene: (scene: string) => void
    reset: () => void
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

export const Controls = ({
    currentScene,
    scenes,
    setScene,
    reset,
}: ControlsProps) => {
    const ecs = useECS()

    const physicsWorldComponent = useSingletonComponent(PhysicsWorldComponent)

    const [tool, setTool] = useState<Tool>(Tools.PICK_PAN)

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
    ] = useControls(
        'Physics',
        () => ({
            physicsStepsPerSecond: {
                label: 'steps per second',
                value: defaultSettings.physicsStepsPerSecond,
            },
            maxSubSteps: {
                label: 'max sub steps',
                value: defaultSettings.maxSubSteps,
            },
            paused: {
                label: 'paused [p]',
                value: defaultSettings.paused,
            },
            useInterpolatedPositions: {
                label: 'interpolated positions',
                value: defaultSettings.useInterpolatedPositions,
            },
        }),
        []
    )

    const timeStep = 1 / physicsStepsPerSecond

    const manualStep = () => {
        if (!physicsWorldComponent) return

        const { physicsWorld } = physicsWorldComponent

        setPhysics({ paused: true })
        physicsWorld.step(timeStep, timeStep)
    }

    useControls(
        'Actions',
        {
            'manual step [s]': button(() => {
                manualStep()
            }),
            'reset [r]': button(() => {
                reset()
            }),
        },
        [physicsWorldComponent, timeStep, reset]
    )

    const [{ drawContacts, drawAABBs, debugPolygons }, setRendering] =
        useControls('Rendering', () => ({
            drawContacts: {
                label: 'draw contacts [c]',
                value: defaultSettings.drawContacts,
            },
            drawAABBs: {
                label: 'draw AABBs [t]',
                value: defaultSettings.drawAABBs,
            },
            debugPolygons: {
                label: 'debug polygons',
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
    })

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
                    }}
                />
                <LevaPanel />
            </ControlsWrapper>

            {tool === Tools.PICK_PAN && <PickPanTool />}

            <MouseObserver />

            <ecs.Entity>
                <ecs.Component
                    type={SettingsComponent}
                    args={[
                        {
                            timeStep,
                            maxSubSteps,
                            paused,
                            useInterpolatedPositions,
                            drawContacts,
                            drawAABBs,
                            debugPolygons,
                        },
                    ]}
                />
            </ecs.Entity>
        </>
    )
}
