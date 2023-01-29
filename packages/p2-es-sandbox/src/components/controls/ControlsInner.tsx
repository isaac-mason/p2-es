import {
    button,
    LevaPanel,
    useControls,
    useCreateStore,
    useStoreContext,
} from 'leva'
import { ButtonInput } from 'leva/plugin'
import React, { useEffect, useMemo } from 'react'
import { PhysicsWorldComponent } from '../../ecs/components/singletons/PhysicsWorldComponent'
import {
    Settings,
    SettingsComponent,
} from '../../ecs/components/singletons/SettingsSingletonComponent'
import { useECS } from '../../hooks/useECS'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { levaTheme } from '../../theme/levaTheme'
import { Tools } from '../../types'
import { ControlsProps } from './Controls'

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
        store,
    }: {
        options: { name: string; value: string }[]
        current: string
        onChange: (value: string) => void
        hidden?: boolean
        store: ReturnType<typeof useCreateStore>
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
        { store },
        [current, options, hidden, store]
    )
}

export const ControlsInner = ({
    scene,
    scenes,
    setScene,
    tool,
    setTool,
    reset,
}: ControlsProps) => {
    const store = useStoreContext()

    const ecs = useECS()

    const physicsWorldComponent = useSingletonComponent(PhysicsWorldComponent)

    useButtonGroupControls('Scene', {
        options: scenes.map((s, idx) => ({
            name: `${s}${idx < 9 ? ` [${idx + 1}]` : ''}`,
            value: s,
        })),
        current: scene,
        onChange: setScene,
        hidden: scenes.length === 1,
        store,
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
        store,
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
            paused: {
                label: 'Paused [p] [space]',
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
        }),
        { store }
    )

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
        { store },
        [physicsWorldComponent, timeStep, reset]
    )

    const [{ drawContacts, drawAABBs, debugPolygons }, setRendering] =
        useControls(
            'Rendering',
            () => ({
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
            }),
            { store }
        )

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

            const n = Number(key)
            if (!Number.isNaN(n)) {
                const sceneIndex = Number(key) - 1
                if (sceneIndex > -1 && sceneIndex < scenes.length) {
                    return setScene(scenes[sceneIndex])
                }
            }
        }

        window.addEventListener('keydown', handler)
        return () => {
            window.removeEventListener('keydown', handler)
        }
    }, [physicsWorldComponent, paused, drawContacts, drawAABBs, reset])

    const settingsComponentArgs: [Settings] = useMemo(
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
            <LevaPanel
                store={store}
                fill
                flat
                theme={levaTheme}
                titleBar={false}
            />
            <ecs.Entity>
                <ecs.Component
                    type={SettingsComponent}
                    args={settingsComponentArgs}
                />
            </ecs.Entity>
        </>
    )
}
