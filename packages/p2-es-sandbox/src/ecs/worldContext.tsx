import React, { createContext, useContext } from 'react'
import { createWorld } from './createWorld'

export const worldContext = createContext<ReturnType<typeof createWorld>>(null!)

type WorldContextProviderProps = {
    world: ReturnType<typeof createWorld>
    children: React.ReactNode
}

export const WorldContextProvider = ({
    world,
    children,
}: WorldContextProviderProps) => (
    <worldContext.Provider value={world}>{children}</worldContext.Provider>
)

export const useWorld = () => {
    return useContext(worldContext)
}
