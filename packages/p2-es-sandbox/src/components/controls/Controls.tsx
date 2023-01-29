import { LevaStoreProvider, useCreateStore } from 'leva'
import React from 'react'
import { Tool } from '../../types'
import { ControlsInner } from './ControlsInner'

export type ControlsProps = {
    scene: string
    tool: Tool
    setTool: (tool: Tool) => void
    scenes: string[]
    setScene: (scene: string) => void
    reset: () => void
}

export const Controls = (props: ControlsProps) => {
    const store = useCreateStore()

    return (
        <LevaStoreProvider store={store}>
            <ControlsInner {...props} />
        </LevaStoreProvider>
    )
}
