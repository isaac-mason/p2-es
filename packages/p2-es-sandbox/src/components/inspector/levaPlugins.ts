import { createPlugin } from 'leva/plugin'
import { Bodies, Constraints, Springs } from './inspectorComponents'

export const bodiesPlugin = createPlugin({
    component: Bodies,
})

export const springsPlugin = createPlugin({
    component: Springs,
})

export const constraintsPlugin = createPlugin({
    component: Constraints,
})
