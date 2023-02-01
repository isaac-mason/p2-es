import * as p2 from 'p2-es'
import { GSSolver } from 'p2-es'
import React, { useEffect } from 'react'
import { Sandbox } from '../../src'

export const CreateSandboxExample = () => {
    useEffect(() => {
        const sandbox = new Sandbox((context) => {
            // Create the world
            const world = new p2.World({
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

            // Create circle body
            const body = new p2.Body({
                mass: 1,
                position: [0, 3],
            })
            body.addShape(new p2.Circle({ radius: 1 }))
            body.allowSleep = true
            body.sleepSpeedLimit = 1 // Body will feel sleepy if speed<1 (speed is the norm of velocity)
            body.sleepTimeLimit = 1 // Body falls asleep after 1s of sleepiness
            world.addBody(body)

            // Create bottom plane
            const plane = new p2.Body({
                position: [0, -1],
            })
            plane.addShape(new p2.Plane())
            world.addBody(plane)

            // Frame demo
            context.frame(0, 0, 4, 4)

            return { world }
        }, document.getElementById('demo')!)

        sandbox.mount()

        return () => {
            sandbox.destroy()
        }
    })

    return (
        <div
            id="demo"
            style={{
                width: '100%',
                height: '100vh',
            }}
        ></div>
    )
}

export default {
    name: 'createSandbox',
    component: CreateSandboxExample,
}
