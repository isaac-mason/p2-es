import { Component } from 'arancini'

export const defaultSandboxSettings: SandboxSettings = {
    physicsStepsPerSecond: 60,
    maxSubSteps: 3,
    paused: false,
    renderInterpolatedPositions: true,
    bodyIds: false,
    bodyIslandColors: false,
    bodySleepOpacity: false,
    drawContacts: false,
    drawAABBs: false,
    debugPolygons: false,
}

export interface SandboxSettings {
    physicsStepsPerSecond: number
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

export interface Settings extends SandboxSettings {
    timeStep: number
}

export class SettingsComponent extends Component implements Settings {
    physicsStepsPerSecond!: number

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
        this.physicsStepsPerSecond = settings.physicsStepsPerSecond
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
