import React, { createContext, useContext } from 'react'
import { createECS } from '../ecs/createECS'

export const ecsContext = createContext<ReturnType<typeof createECS>>(null!)

type EcsContextProviderProps = {
    ecs: ReturnType<typeof createECS>
    children: React.ReactNode
}

export const EcsContextProvider = ({
    ecs,
    children,
}: EcsContextProviderProps) => (
    <ecsContext.Provider value={ecs}>{children}</ecsContext.Provider>
)

export const useECS = () => {
    return useContext(ecsContext)
}
