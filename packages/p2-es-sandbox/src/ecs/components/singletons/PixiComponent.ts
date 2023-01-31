import { Component } from 'arancini'
import { Application, Container, Graphics } from 'pixi.js'

export type Pixi = {
    domElement: HTMLElement
    canvasElement: HTMLCanvasElement
    application: Application
    stage: Container
    container: Container
    background: Graphics
    graphics: {
        aabb: Graphics
        contacts: Graphics
        pick: Graphics
        drawShape: Graphics
    }
    onResize: () => void
}

export class PixiComponent extends Component implements Pixi {
    domElement!: HTMLElement

    canvasElement!: HTMLCanvasElement

    application!: Application

    stage!: Container

    container!: Container

    background!: Graphics

    graphics!: Pixi['graphics']

    onResize!: () => void

    construct(pixi: Pixi) {
        this.domElement = pixi.domElement
        this.canvasElement = pixi.canvasElement
        this.application = pixi.application
        this.stage = pixi.stage
        this.container = pixi.container
        this.background = pixi.background
        this.graphics = pixi.graphics
        this.onResize = pixi.onResize
    }
}
