import { Component, ComponentClass } from 'arancini'
import { useEffect, useState } from 'react'
import { useECS } from '../ecs/ecsContext'

export const useSingletonComponent = <T extends Component>(
    componentClass: ComponentClass<T>
) => {
    const ecs = useECS()

    const query = ecs.useQuery([componentClass])

    const [systemComponent, setSystemComponent] = useState<T | null>(null)

    useEffect(() => {
        const entity = query.first
        if (!entity) {
            return setSystemComponent(null)
        }

        const component = entity.find(componentClass)
        if (!component) {
            return setSystemComponent(null)
        }

        setSystemComponent(component)
    }, [query])

    return systemComponent
}
