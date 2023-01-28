import type { World } from 'p2-es'
import type { SandboxContext } from './sandboxContext'
import { Tool } from './tool'

export type Scenes = Record<string, { setup: SandboxFunction }>

export type SandboxFunction = (context: SandboxContext) => {
    world: World
    defaultTool?: Tool
    teardown?: () => void
}
