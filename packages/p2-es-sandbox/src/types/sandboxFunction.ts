import type { World } from 'p2-es'
import type { SandboxContext } from './sandboxContext'

export type SandboxFunction = (context: SandboxContext) => { world: World }
