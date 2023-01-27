import { createECS as createAranciniECS } from '@arancini/react'
import { World } from 'arancini'
import { PhysicsBodyComponent } from './components/PhysicsBodyComponent'
import { PhysicsConstraintComponent } from './components/PhysicsConstraintComponent'
import { PhysicsSpringComponent } from './components/PhysicsSpringComponent'
import { MouseComponent } from './components/singletons/MouseComponent'
import { PhysicsWorldComponent } from './components/singletons/PhysicsWorldComponent'
import { PixiComponent } from './components/singletons/PixiComponent'
import { SettingsComponent } from './components/singletons/SettingsSingletonComponent'
import { SpriteComponent } from './components/SpriteComponent'
import { UpdateHandlerComponent } from './components/UpdateHandlerComponent'

export const createECS = () => {
    const world = new World()

    world.registerComponent(PhysicsBodyComponent)
    world.registerComponent(PhysicsSpringComponent)
    world.registerComponent(PhysicsWorldComponent)
    world.registerComponent(PhysicsConstraintComponent)
    world.registerComponent(PixiComponent)
    world.registerComponent(SettingsComponent)
    world.registerComponent(SpriteComponent)
    world.registerComponent(MouseComponent)
    world.registerComponent(UpdateHandlerComponent)

    world.init()

    return createAranciniECS(world)
}
