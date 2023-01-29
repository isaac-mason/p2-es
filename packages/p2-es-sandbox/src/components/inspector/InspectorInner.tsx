import { LevaPanel, useControls, useStoreContext } from 'leva'
import React from 'react'
import { levaTheme } from '../../theme/levaTheme'
import { InspectorProps } from './Inspector'
import { bodiesPlugin, constraintsPlugin, springsPlugin } from './levaPlugins'

export const InspectorInner = ({ hidden }: InspectorProps) => {
    const store = useStoreContext()

    useControls('Bodies', { bodies: bodiesPlugin() }, { store })

    useControls('Springs', { bodies: springsPlugin() }, { store })

    useControls('Constraints', { bodies: constraintsPlugin() }, { store })

    return (
        <LevaPanel
            titleBar={{ title: 'World Inspector', filter: false }}
            fill
            hidden={hidden}
            store={store}
            theme={levaTheme}
        />
    )
}
