import React from 'react'
import ReactDOM from 'react-dom/client'
import { Sandbox } from './components/Sandbox'
import { SandboxFunction, Scenes } from './types'

export type CreateSandboxProps = {
    domElement: HTMLElement

    title?: string

    /**
     * @default true
     */
    controls?: boolean
}

export const createSandbox = (
    setup: SandboxFunction | Scenes,
    { domElement, title, controls = true }: CreateSandboxProps
) => {
    const root = ReactDOM.createRoot(domElement)

    root.render(<Sandbox setup={setup} controls={controls} title={title} />)

    return {
        unmount: () => {
            root.unmount()
        },
    }
}
