import { useEffect } from 'react'
import { PixiComponent } from '../../ecs/components/singletons/PixiComponent'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'

export const PixiApplication = () => {
    const pixiComponent = useSingletonComponent(PixiComponent)

    useEffect(() => {
        if (!pixiComponent) return

        const { application } = pixiComponent

        application.start()

        return () => {
            if (application) {
                application.stop()
            }
        }
    }, [pixiComponent])

    return null
}
