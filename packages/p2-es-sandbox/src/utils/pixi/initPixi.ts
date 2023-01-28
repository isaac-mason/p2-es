import '@pixi/events'
import { Application, Container, Graphics } from 'pixi.js'
import { Pixi } from '../../ecs/components/singletons/PixiComponent'

export const initPixi = (
    domElement: HTMLElement
): Pixi & { destroyPixi: () => void } => {
    const canvasElement = document.createElement('canvas')
    canvasElement.style.width = '100%'
    canvasElement.style.height = '100%'
    domElement.appendChild(canvasElement)

    const application = new Application({
        backgroundColor: 0xffffff,
        antialias: true,
        width: 1280,
        height: 720,
        view: canvasElement,
    })

    const stage = new Container()
    stage.interactive = true
    application.stage = stage

    const container = new Container()
    container.scale.x = 200
    container.scale.y = -200 // Flip Y direction.

    const background = new Graphics()

    const graphics = {
        aabb: new Graphics(),
        contacts: new Graphics(),
        pick: new Graphics(),
        drawShape: new Graphics(),
    }

    stage.addChild(background)
    stage.addChild(container)

    container.addChild(graphics.aabb)
    container.addChild(graphics.contacts)
    container.addChild(graphics.pick)
    container.addChild(graphics.drawShape)

    const onResize = () => {
        const dpr = window.devicePixelRatio || 1
        const rect = domElement.getBoundingClientRect()
        const w = rect.width * dpr
        const h = rect.height * dpr

        application.renderer.resize(w, h)

        background.clear()
        background.beginFill(0xffffff)
        background.drawRect(
            0,
            0,
            application.renderer.view.width,
            application.renderer.view.height
        )
        background.endFill()
    }

    onResize()
    window.addEventListener('resize', onResize)

    const destroyPixi = () => {
        window.removeEventListener('resize', onResize)
        application.destroy()
        canvasElement.remove()
    }

    return {
        application,
        stage,
        container,
        graphics,
        background,
        canvasElement,
        destroyPixi,
    }
}
