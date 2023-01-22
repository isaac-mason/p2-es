import { createECS as createAranciniECS } from '@arancini/react'
import { World } from 'arancini'
import { PhysicsBodyComponent } from './components/PhysicsBodyComponent'
import { PhysicsSpringComponent } from './components/PhysicsSpringComponent'
import { MouseComponent } from './components/singletons/MouseComponent'
import { PhysicsWorldComponent } from './components/singletons/PhysicsWorldComponent'
import { PixiComponent } from './components/singletons/PixiComponent'
import { SettingsComponent } from './components/singletons/SettingsSingletonComponent'
import { UpdateHandlersComponent } from './components/singletons/UpdateHandlersSingletonComponent'
import { SpriteComponent } from './components/SpriteComponent'
import { PhysicsAABBRendererSystem } from './systems/PhysicsAABBRendererSystem'
import { PhysicsBodyRendererSystem } from './systems/PhysicsBodyRendererSystem'
import { PhysicsContactsRendererSystem } from './systems/PhysicsContactsRendererSystem'
import { PhysicsSpringRendererSystem } from './systems/PhysicsSpringRendererSystem'
import { PhysicsSystem } from './systems/PhysicsSystem'
import { PixiRendererSystem } from './systems/PixiRendererSystem'

export const createECS = () => {
    const world = new World()

    world.registerComponent(PhysicsBodyComponent)
    world.registerComponent(PhysicsSpringComponent)
    world.registerComponent(PhysicsWorldComponent)
    world.registerComponent(PixiComponent)
    world.registerComponent(SettingsComponent)
    world.registerComponent(SpriteComponent)
    world.registerComponent(MouseComponent)
    world.registerComponent(UpdateHandlersComponent)

    world.registerSystem(PhysicsSystem)
    world.registerSystem(PhysicsBodyRendererSystem)
    world.registerSystem(PhysicsSpringRendererSystem)
    world.registerSystem(PhysicsAABBRendererSystem)
    world.registerSystem(PhysicsContactsRendererSystem)
    world.registerSystem(PixiRendererSystem)

    world.init()

    return createAranciniECS(world)
}
