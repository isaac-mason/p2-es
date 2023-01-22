import { Component } from 'arancini'
import { Renderer, Container, Graphics } from 'pixi.js'

export type Pixi = {
    canvasElement: HTMLCanvasElement
    renderer: Renderer
    stage: Container
    container: Container
    background: Graphics
    graphics: {
        aabb: Graphics
        contacts: Graphics
        pick: Graphics
    }
}

export class PixiComponent extends Component {
    canvasElement!: HTMLCanvasElement

    renderer!: Renderer

    stage!: Container

    container!: Container

    background!: Graphics

    graphics!: {
        aabb: Graphics
        contacts: Graphics
        pick: Graphics
    }

    construct(pixi: Pixi) {
        this.canvasElement = pixi.canvasElement
        this.renderer = pixi.renderer
        this.stage = pixi.stage
        this.container = pixi.container
        this.background = pixi.background
        this.graphics = pixi.graphics
    }
}
