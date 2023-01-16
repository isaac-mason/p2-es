import { Renderer, Container, Graphics } from 'pixi.js'

export const initPixi = (domElement: HTMLElement) => {
    const canvasElement = document.createElement('canvas')
    canvasElement.style.width = '100%'
    canvasElement.style.height = '100%'
    domElement.appendChild(canvasElement)

    const renderer = new Renderer({
        backgroundColor: 0xffffff,
        antialias: true,
        width: 1280,
        height: 720,
        view: canvasElement,
    })

    const stage = new Container()
    stage.interactive = true

    const container = new Container()
    container.scale.x = 200
    container.scale.y = -200 // Flip Y direction.

    const background = new Graphics()

    const graphics = {
        aabb: new Graphics(),
        contacts: new Graphics(),
        pick: new Graphics(),
    }

    stage.addChild(background)
    stage.addChild(container)
    stage.addChild(graphics.aabb)
    stage.addChild(graphics.contacts)
    stage.addChild(graphics.pick)

    const onResize = () => {
        const dpr = window.devicePixelRatio || 1
        const rect = domElement.getBoundingClientRect()
        const w = rect.width * dpr
        const h = rect.height * dpr

        renderer.resize(w, h)

        background.clear()
        background.beginFill(0xffffff)
        background.drawRect(0, 0, renderer.view.width, renderer.view.height)
        background.endFill()
    }

    onResize()
    window.addEventListener('resize', onResize)

    const destroyPixi = () => {
        window.removeEventListener('resize', onResize)
        renderer.destroy()
        canvasElement.remove()
    }

    return {
        renderer,
        stage,
        container,
        graphics,
        background,
        canvasElement,
        destroyPixi,
    }
}
