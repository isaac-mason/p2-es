import { createECS } from '@arancini/react'
import { World } from 'arancini'
import { MouseComponent } from './components/MouseComponent'
import { PhysicsBodyComponent } from './components/PhysicsBodyComponent'
import { PhysicsSpringComponent } from './components/PhysicsSpringComponent'
import { PhysicsWorldComponent } from './components/PhysicsWorldComponent'
import { PixiComponent } from './components/PixiComponent'
import { SandboxContextComponent } from './components/SandboxContextComponent'
import { SettingsComponent } from './components/SettingsComponent'
import { SpriteComponent } from './components/SpriteComponent'
import { PhysicsAABBRendererSystem } from './systems/PhysicsAABBRendererSystem'
import { PhysicsBodyRendererSystem } from './systems/PhysicsBodyRendererSystem'
import { PhysicsContactsRendererSystem } from './systems/PhysicsContactsRendererSystem'
import { PhysicsSpringRendererSystem } from './systems/PhysicsSpringRendererSystem'
import { PhysicsSystem } from './systems/PhysicsSystem'
import { PixiRendererSystem } from './systems/PixiRendererSystem'

export const ecs = () => {
    const world = new World()

    world.registerComponent(PhysicsBodyComponent)
    world.registerComponent(PhysicsSpringComponent)
    world.registerComponent(PhysicsWorldComponent)
    world.registerComponent(PixiComponent)
    world.registerComponent(SettingsComponent)
    world.registerComponent(SpriteComponent)
    world.registerComponent(SandboxContextComponent)
    world.registerComponent(MouseComponent)

    world.registerSystem(PhysicsSystem)
    world.registerSystem(PhysicsBodyRendererSystem)
    world.registerSystem(PhysicsSpringRendererSystem)
    world.registerSystem(PhysicsAABBRendererSystem)
    world.registerSystem(PhysicsContactsRendererSystem)
    world.registerSystem(PixiRendererSystem)

    world.init()

    return createECS(world)
}
