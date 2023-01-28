import { SandboxFunction } from './sandboxFunction'

export type Scenes = Record<string, { setup: SandboxFunction }>
