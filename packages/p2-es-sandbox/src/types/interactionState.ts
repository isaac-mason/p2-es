export const InteractionStates = {
    DEFAULT: 'DEFAULT',
    PANNING: 'PANNING',
    DRAGGING: 'DRAGGING',
    DRAW_POLYGON: 'DRAW_POLYGON',
    DRAWING_POLYGON: 'DRAWING_POLYGON',
    DRAW_CIRCLE: 'DRAW_CIRCLE',
    DRAWING_CIRCLE: 'DRAWING_CIRCLE',
    DRAW_RECTANGLE: 'DRAW_RECTANGLE',
    DRAWING_RECTANGLE: 'DRAWING_RECTANGLE',
} as const

export type InteractionState =
    (typeof InteractionStates)[keyof typeof InteractionStates]
