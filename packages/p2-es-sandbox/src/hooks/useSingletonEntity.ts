import { Entity, QueryDescription } from 'arancini'
import { useEffect, useState } from 'react'
import { useECS } from '../context/ecsContext'

export const useSingletonEntity = (queryDescription: QueryDescription) => {
    const ecs = useECS()

    const query = ecs.useQuery(queryDescription)

    const [entity, setEntity] = useState<Entity | null>(null)

    useEffect(() => {
        const e = query.first
        setEntity(e || null)
    }, [query])

    return entity
}
