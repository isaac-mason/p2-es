import { button, Leva, LevaPanel, useControls } from 'leva'
import React, { useEffect } from 'react'
import { up } from 'styled-breakpoints'
import styled from 'styled-components'
import { useECS } from '../context/ecsContext'
import { SettingsComponent } from '../ecs/components/SettingsComponent'
import { PhysicsSystem } from '../ecs/systems/PhysicsSystem'
import { useConst } from '../hooks/useConst'
import { Tools } from '../types'

const ControlsWrapper = styled.div`
    padding: 5px;
    background: #181c20;
    width: 100%;

    ${up('md')} {
        width: 320px;
    }
`

const DefaultTool = Tools.PICK_PAN

const ToolOptions = {
    'Pick/Pan [q]': Tools.PICK_PAN,
    'Polygon [d]': Tools.POLYGON,
    'Circle [a]': Tools.CIRCLE,
    'Rectangle [f]': Tools.RECTANGLE,
}

const defaultPhysicsStepsPerSecond = 60

export const defaultSettings = {
    physicsStepsPerSecond: defaultPhysicsStepsPerSecond,
    timeStep: 1 / defaultPhysicsStepsPerSecond,
    maxSubSteps: 3,
    paused: false,
    useInterpolatedPositions: true,
    drawContacts: false,
    drawAABBs: false,
    debugPolygons: false,
}

export type ControlsProps = {
    reset: () => void
}

export const Controls = ({ reset }: ControlsProps) => {
    const ecs = useECS()

    const physicsSystem = useConst(() => ecs.world.getSystem(PhysicsSystem))

    const [{ tool: _tool }, setTool] = useControls('Tool', () => ({
        tool: {
            label: 'selected tool',
            value: DefaultTool,
            options: ToolOptions,
        },
    }))

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
                label: 'physics steps per second',
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

    const manualStep = () => {
        setPhysics({ paused: true })
        physicsSystem?.manualStep()
    }

    useControls('Actions', {
        'manual step [s]': button(() => {
            manualStep()
        }),
        'reset [r]': button(() => {
            reset()
        }),
    })

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
                return setTool({ tool: Tools.PICK_PAN })
            }

            if (key === 'd') {
                return setTool({ tool: Tools.POLYGON })
            }

            if (key === 'a') {
                return setTool({ tool: Tools.CIRCLE })
            }

            if (key === 'f') {
                return setTool({ tool: Tools.RECTANGLE })
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

            <ecs.Entity>
                <ecs.Component
                    type={SettingsComponent}
                    args={[
                        {
                            timeStep: 1 / physicsStepsPerSecond,
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
