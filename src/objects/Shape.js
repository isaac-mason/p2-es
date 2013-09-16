exports.Shape = Shape;
exports.Particle = Particle;
exports.Compound = Compound;
exports.Circle = Circle;
exports.Plane = Plane;
exports.Convex = Convex;
exports.Line = Line;

/**
 * Base class for shapes.
 * @class Shape
 * @constructor
 */
function Shape(type){
    this.type = type;
};

Shape.CIRCLE =      1;
Shape.PARTICLE =    2;
Shape.PLANE =       4;
Shape.CONVEX =      8;
Shape.LINE =        16;

/**
 * Should return the moment of inertia around the Z axis of the body given the total mass. See <a href="http://en.wikipedia.org/wiki/List_of_moments_of_inertia">Wikipedia's list of moments of inertia</a>.
 * @method computeMomentOfInertia
 * @param  {Number} mass
 * @return {Number} If the inertia is infinity or if the object simply isn't possible to rotate, return 0.
 */
Shape.prototype.computeMomentOfInertia = function(mass){
    throw new Error("Shape.computeMomentOfInertia is not implemented in this Shape...");
};

/**
 * Particle shape class.
 * @class Particle
 * @constructor
 * @extends {Shape}
 */
function Particle(){
    Shape.call(this,Shape.PARTICLE);
};
Particle.prototype = new Shape();
Particle.prototype.computeMomentOfInertia = function(mass){
    return 0; // Can't rotate a particle
};


/**
 * Circle shape class.
 * @class Circle
 * @extends {Shape}
 * @constructor
 * @param {number} radius
 */
function Circle(radius){
    Shape.call(this,Shape.CIRCLE);

    /**
     * The radius of the circle.
     * @property radius
     * @type {number}
     */
    this.radius = radius || 1;
};
Circle.prototype = new Shape();
Circle.prototype.computeMomentOfInertia = function(mass){
    var r = this.radius;
    return mass * r * r / 2;
};

/**
 * Plane shape class. The plane is facing in the Y direction.
 * @class Plane
 * @extends {Shape}
 * @constructor
 */
function Plane(){
    Shape.call(this,Shape.PLANE);
};
Plane.prototype = new Shape();
Plane.prototype.computeMomentOfInertia = function(mass){
    return 0; // Plane is infinite. The inertia should therefore be infinty but by convention we set 0 here
};

/**
 * Convex shape class.
 * @class Convex
 * @constructor
 * @extends {Shape}
 * @param {Array} vertices An array of Float32Array vertices that span this shape. Vertices are given in counter-clockwise (CCW) direction.
 */
function Convex(vertices){
    Shape.call(this,Shape.CONVEX);

    /**
     * Vertices defined in the local frame.
     * @property vertices
     * @type {Array}
     */
    this.vertices = vertices;
};
Convex.prototype = new Shape();
Convex.prototype.computeMomentOfInertia = function(mass){
    return 1;
};

/**
 * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
 * @class Plane
 * @extends {Shape}
 * @constructor
 */
function Line(length){
    Shape.call(this,Shape.LINE);
    this.length = length;
};
Line.prototype = new Shape();
Line.prototype.computeMomentOfInertia = function(mass){
    return 1;
};

/**
 * Compound shape class. Use it if you need several basic shapes in your body.
 * @class Compound
 * @extends {Shape}
 * @constructor
 */
function Compound(){
    Shape.call(this);
    this.children       = [];
    this.childOffsets   = [];
    this.childAngles    = [];
};
Compound.prototype = new Shape();
Compound.prototype.computeMomentOfInertia = function(mass){
    var children = this.children,
        N = children.length,
        m = mass / N,
        I = 0;

    for(var i=0; i<N; i++){
        var child = children[i],
            r = vec2.length(this.childOffsets[i]),
            Icm = child.computeMomentOfInertia(m);
        I += Icm + m*r*r;
    }

    return I;
};

Compound.prototype.addChild = function(shape,offset,angle){
    this.children.push(shape);
    this.childOffsets.push(offset);
    this.childAngles.push(angle);
};
