export const Tools = {
    PICK_PAN: 'PICK_PLAN',
    POLYGON: 'POLYGON',
    CIRCLE: 'CIRCLE',
    RECTANGLE: 'RECTANGLE',
}

export type Tool = (typeof Tools)[keyof typeof Tools]
