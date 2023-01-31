import { Component } from 'arancini'

export interface Settings {
    timeStep: number
    maxSubSteps: number
    paused: boolean

    bodyIds: boolean
    bodyIslandColors: boolean
    bodySleepOpacity: boolean

    debugPolygons: boolean
    drawContacts: boolean
    drawAABBs: boolean
    renderInterpolatedPositions: boolean
}

export class SettingsComponent extends Component implements Settings {
    timeStep!: number

    maxSubSteps!: number

    paused!: boolean

    renderInterpolatedPositions!: boolean

    bodyIds!: boolean

    bodyIslandColors!: boolean

    bodySleepOpacity!: boolean

    debugPolygons!: boolean

    drawContacts!: boolean

    drawAABBs!: boolean

    construct(settings: Settings) {
        this.timeStep = settings.timeStep
        this.maxSubSteps = settings.maxSubSteps
        this.paused = settings.paused
        this.renderInterpolatedPositions = settings.renderInterpolatedPositions
        this.bodyIds = settings.bodyIds
        this.bodyIslandColors = settings.bodyIslandColors
        this.bodySleepOpacity = settings.bodySleepOpacity
        this.debugPolygons = settings.debugPolygons
        this.drawContacts = settings.drawContacts
        this.drawAABBs = settings.drawAABBs
    }
}
