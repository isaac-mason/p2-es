import type { World } from 'p2-es'
import type { SandboxContext } from './sandboxContext'
import { Tool } from './tool'

export type Scenes = Record<string, { setup: SandboxFunction }>

export type SandboxToolsConfig = {
    default?: Tool
}

export type SandboxConfig = {
    world: World
    teardown?: () => void
    tools?: SandboxToolsConfig
}

export type SandboxFunction = (context: SandboxContext) => SandboxConfig
