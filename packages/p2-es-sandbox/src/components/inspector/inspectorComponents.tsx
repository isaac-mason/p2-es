import { Body, Constraint, Spring } from 'p2-es'
import React from 'react'
import styled from 'styled-components'
import { PhysicsBodyComponent } from '../../ecs/components/PhysicsBodyComponent'
import { PhysicsSpringComponent } from '../../ecs/components/PhysicsSpringComponent'
import { PhysicsWorldComponent } from '../../ecs/components/singletons/PhysicsWorldComponent'
import { useECS } from '../../hooks/useECS'
import { useSingletonComponent } from '../../hooks/useSingletonComponent'
import { interfaceTheme } from '../../theme/interfaceTheme'

const ListWrapper = styled.div`
    max-height: 200px;
    overflow-y: auto;
`

const InfoWrapper = styled.div`
    padding: 5px;
    color: ${interfaceTheme.color.highlight1};
`

const BodyInfo = (props: { body: Body }) => {
    return (
        <InfoWrapper>
            <div>Body {props.body.id}</div>
        </InfoWrapper>
    )
}

export const Bodies = () => {
    const ecs = useECS()

    const bodies = ecs.useQuery([PhysicsBodyComponent])

    return (
        <ListWrapper>
            {bodies.entities.map((entity) => {
                const { body } = entity.get(PhysicsBodyComponent)

                return <BodyInfo key={body.id} body={body} />
            })}
        </ListWrapper>
    )
}

const SpringInfo = (props: { spring: Spring }) => {
    return (
        <InfoWrapper>
            <div>Spring</div>
            <div>bodyA - {props.spring.bodyA.id}</div>
            <div>bodyB - {props.spring.bodyB.id}</div>
        </InfoWrapper>
    )
}

export const Springs = () => {
    const ecs = useECS()

    const springs = ecs.useQuery([PhysicsSpringComponent])

    return (
        <ListWrapper>
            {springs.entities.map((entity) => {
                const { spring } = entity.get(PhysicsSpringComponent)

                return <SpringInfo key={entity.id} spring={spring} />
            })}
        </ListWrapper>
    )
}

const ConstraintInfo = (props: { constraint: Constraint }) => {
    return (
        <InfoWrapper>
            <div>Constraint</div>
            <div>bodyA - {props.constraint.bodyA.id}</div>
            <div>bodyB - {props.constraint.bodyB.id}</div>
        </InfoWrapper>
    )
}

export const Constraints = () => {
    const physicsWorldComponent = useSingletonComponent(PhysicsWorldComponent)

    return (
        <ListWrapper>
            {physicsWorldComponent?.world.constraints.map((constraint, idx) => {
                return <ConstraintInfo key={idx} constraint={constraint} />
            })}
        </ListWrapper>
    )
}
