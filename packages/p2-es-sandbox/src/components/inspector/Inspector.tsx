import { LevaStoreProvider, useCreateStore } from 'leva'
import React from 'react'
import { InspectorInner } from './InspectorInner'

export type InspectorProps = {
    hidden: boolean
}

export const Inspector = (props: InspectorProps) => {
    const store = useCreateStore()

    return (
        <LevaStoreProvider store={store}>
            <InspectorInner {...props} />
        </LevaStoreProvider>
    )
}
