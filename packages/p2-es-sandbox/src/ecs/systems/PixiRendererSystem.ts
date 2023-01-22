import { System } from 'arancini'
import { PixiComponent } from '../components/singletons/PixiComponent'
import { SpriteComponent } from '../components/SpriteComponent'

export class PixiRendererSystem extends System {
    queries = {
        pixi: this.query([PixiComponent]),
        sprites: this.query([SpriteComponent]),
    }

    get pixi(): PixiComponent | undefined {
        return this.queries.pixi.first?.find(PixiComponent)
    }

    onUpdate(): void {
        const { pixi } = this
        if (!pixi) return

        const { renderer, stage } = pixi

        renderer.render(stage)
    }
}
