import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { useFrame } from '../../hooks/useFrame'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { STAGES } from '../../stages'

export const PixiRenderer = () => {
    const pixiComponent = useSingletonComponent(PixiComponent)

    useFrame(
        () => {
            if (!pixiComponent) return

            const { renderer, stage } = pixiComponent

            renderer.render(stage)
        },
        [pixiComponent],
        STAGES.PIXI
    )

    return null
}
