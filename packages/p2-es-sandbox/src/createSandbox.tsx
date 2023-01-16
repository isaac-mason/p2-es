import React from 'react'
import ReactDOM from 'react-dom/client'
import { Sandbox } from './components/Sandbox'
import { SandboxFunction } from './types'

export type CreateSandboxProps = {
    domElement: HTMLElement

    /**
     * @default true
     */
    controls?: boolean
}

export const createSandbox = (
    sandboxFunction: SandboxFunction,
    { domElement, controls = true }: CreateSandboxProps
) => {
    const root = ReactDOM.createRoot(domElement)

    root.render(
        <Sandbox sandboxFunction={sandboxFunction} controls={controls} />
    )

    return {
        unmount: () => {
            root.unmount()
        },
    }
}
