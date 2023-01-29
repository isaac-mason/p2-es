import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './components/App'
import { SandboxFunction, Scenes } from './types'

export type SandboxProps = {
    title?: string

    /**
     * @default true
     */
    controls?: boolean
}

export class Sandbox {
    root?: ReactDOM.Root

    // eslint-disable-next-line no-useless-constructor
    constructor(
        private setup: SandboxFunction | Scenes,
        private domElement: HTMLElement,
        private config?: SandboxProps
    ) {}

    init(): this {
        const config = {
            controls: true,
            ...this.config,
        }

        this.root = ReactDOM.createRoot(this.domElement)

        this.root.render(
            <App
                setup={this.setup}
                controls={config.controls}
                title={config.title}
            />
        )

        return this
    }

    destroy() {
        if (this.root) {
            this.root.unmount()
            this.root = undefined
        }
    }
}
