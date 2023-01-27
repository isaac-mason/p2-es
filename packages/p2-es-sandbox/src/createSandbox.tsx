import React from 'react'
import ReactDOM from 'react-dom/client'
import { Sandbox } from './components/Sandbox'
import { SandboxFunction } from './types'
import { Scenes } from './types/scene'

export type CreateSandboxProps = {
    domElement: HTMLElement

    /**
     * @default true
     */
    controls?: boolean
}

export const createSandbox = (
    setup: SandboxFunction | Scenes,
    { domElement, controls = true }: CreateSandboxProps
) => {
    const root = ReactDOM.createRoot(domElement)

    root.render(<Sandbox setup={setup} controls={controls} />)

    return {
        unmount: () => {
            root.unmount()
        },
    }
}
