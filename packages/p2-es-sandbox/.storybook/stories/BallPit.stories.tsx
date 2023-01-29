import * as p2 from 'p2-es'
import { GSSolver } from 'p2-es'
import React from 'react'
import { SandboxContext } from '../../src'
import { App } from '../../src/components/App'

export const BallPit = () => {
    const fn = (context: SandboxContext) => {
        var enablePositionNoise = true, // Add some noise in circle positions
            N = 15, // Number of circles in x direction
            M = 15, // and in y
            r = 0.07, // circle radius
            d = 2.2 // Distance between circle centers

        // Create the world
        var world = new p2.World({
            gravity: [0, -5],
        })

        // Pre-fill object pools. Completely optional but good for performance!
        world.overlapKeeper.recordPool.resize(16)
        world.narrowphase.contactEquationPool.resize(1024)
        world.narrowphase.frictionEquationPool.resize(1024)

        // Set stiffness of all contacts and constraints
        world.setGlobalStiffness(1e8)

        // Max number of solver iterations to do
        ;(world.solver as GSSolver).iterations = 20

        // Solver error tolerance
        ;(world.solver as GSSolver).tolerance = 0.02

        // Enables sleeping of bodies
        world.sleepMode = p2.World.BODY_SLEEPING

        // Create circle bodies
        for (var i = 0; i < N; i++) {
            for (var j = M - 1; j >= 0; j--) {
                var x =
                    (i - N / 2) * r * d +
                    (enablePositionNoise ? Math.random() * r : 0)
                var y = (j - M / 2) * r * d
                var p = new p2.Body({
                    mass: 1,
                    position: [x, y],
                })
                p.addShape(new p2.Circle({ radius: r }))
                p.allowSleep = true
                p.sleepSpeedLimit = 1 // Body will feel sleepy if speed<1 (speed is the norm of velocity)
                p.sleepTimeLimit = 1 // Body falls asleep after 1s of sleepiness
                world.addBody(p)
            }
        }

        // Compute max/min positions of circles
        var xmin = (-N / 2) * r * d,
            xmax = (N / 2) * r * d,
            ymin = (-M / 2) * r * d,
            ymax = (M / 2) * r * d

        // Create bottom plane
        var plane = new p2.Body({
            position: [0, ymin],
        })
        plane.addShape(new p2.Plane())
        world.addBody(plane)

        // Left plane
        var planeLeft = new p2.Body({
            angle: -Math.PI / 2,
            position: [xmin, 0],
        })
        planeLeft.addShape(new p2.Plane())
        world.addBody(planeLeft)

        // Right plane
        var planeRight = new p2.Body({
            angle: Math.PI / 2,
            position: [xmax, 0],
        })
        planeRight.addShape(new p2.Plane())
        world.addBody(planeRight)

        // Frame demo
        context.frame(0, 0, 4, 4)

        return { world }
    }

    return <App setup={fn} />
}

export default {
    name: 'BallPit',
    component: BallPit,
}
