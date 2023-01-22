import { Component } from 'arancini'

export type Settings = {
    timeStep: number
    maxSubSteps: number
    paused: boolean
    useInterpolatedPositions: boolean
    debugPolygons: boolean
    drawContacts: boolean
    drawAABBs: boolean
}

export class SettingsComponent extends Component {
    settings!: Settings

    construct(settings: Settings) {
        this.settings = settings
    }
}
