export type UpdateHandler = (delta: number) => void

export type UpdateHandlers = Set<UpdateHandler>
