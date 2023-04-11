import p2 from 'p2'
import * as p2es from 'p2-es'

const benchmark = (name, impl) => {
    try {
        const world = new impl.World({
            gravity: [0, -9.81],
        })

        for (let i = 0; i < 100; i++) {
            const boxBody = new impl.Body()
            boxBody.addShape(
                new impl.Box({
                    height: 1,
                    width: 1,
                })
            )

            world.addBody(boxBody)
        }

        const start = performance.now()

        for (let i = 0; i < 5000; i++) {
            world.step(1 / 60)
        }

        const end = performance.now()

        console.log(`${name} took ${end - start}ms`)
    } catch (e) {
        console.log(`error while running benchmark for ${name}`, e)
    }
}

benchmark('p2-es', p2es)
benchmark('p2', p2)
