let view;
let ctx;
let scene;
let start_time;

const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

// Initialization function - called when web page loads
function init() {
    let w = 800;
    let h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
             
            //ORIGINAL:                                         CONFIRMED TO WORK
            type: 'perspective',
            prp: Vector3(44, 20, -16),
            srp: Vector3(20, 20, -40),
            vup: Vector3(0, 1, 0),
            clip: [-19, 5, -10, 8, 12, 100]
            
            // head-on view                                     CONFIRMED TO WORK
            // type: 'perspective',
            // prp: Vector3(10, 9, 0),
            // srp: Vector3(10, 9, -30),
            // vup: Vector3(0, 1, 0),
            // // left, right, bottom, top, near, far
            // clip: [-11, 11, -11, 11, 30, 100]
            
            // side view                                        CONFIRMED TO WORK                     
            // type: 'perspective',
            // prp: Vector3(38, 10, -45),               
            // srp: Vector3(20, 10, -45),
            // vup: Vector3(0, 1, 0),
            // // left, right, bottom, top, near, far
            // clip: [-16, 16, -15, 17, 18, 100]

            // side view - modified PRP                             CONFIRMED TO WORK
            // type: 'perspective',
            // prp: Vector3(38, 10, 0),
            // srp: Vector3(20, 10, -45),
            // vup: Vector3(0, 1, 0),
            // // left, right, bottom, top, near, far
            // clip: [-16, 16, -15, 17, 18, 100]

            // side view - modified                             CONFIRMED TO WORK
            // type: 'perspective',
            // prp: Vector3(38, 10, -15),
            // srp: Vector3(20, 10, -45),
            // vup: Vector3(0, 1, 0),
            // // left, right, bottom, top, near, far
            // clip: [-16, 16, -15, 17, 18, 100]

            // side view - modified                             CONFIRMED TO WORK
            // type: 'parallel',
            // prp: Vector3(0, 0, 0),
            // srp: Vector3(20, 10, -45),
            // vup: Vector3(0, 1, 0),
            // // left, right, bottom, top, near, far
            // clip: [-16, 16, -15, 17, 18, 100]

            
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                matrix: new Matrix(4, 4)
            },
            {
                type: "cube",
                center: [-10, 4, -10],
                width: 8,
                height: 8,
                depth: 8,
                animation: {
                    axis: "x",
                    rps: 0.5
                },
                matrix: new Matrix(4, 4)
            }
            // {
            //     type: "cylinder",
            //     center: [50, -10, -49],
            //     radius: 20.0,
            //     height: 15,
            //     sides: 25,
            //     animation: {
            //         axis: "x",
            //         rps: 0.5
            //     }
            // },
            // {
            //     type: "cone",
            //     center: [-15, -5, -15],
            //     radius: 25.0,
            //     height: 40,
            //     sides: 25,
            //     animation: {
            //         axis: "y",
            //         rps: 0.5
            //     }
            // },
            // {
            //     type: "sphere",
            //     center: [20, 3, -30],
            //     radius: 20,
            //     slices: 10,
            //     stacks: 10,
            //     animation: {
            //         axis: "z",
            //         rps: 0.5
            //     }
            // }
        ]
    };
    createModelVertsAndEdges();

    // event handler for pressing arrow keys
    document.addEventListener('keydown', onKeyDown, false);
    
    // start animation loop
    start_time = performance.now(); // current timestamp in milliseconds
    window.requestAnimationFrame(animate);
}



// Animation loop - repeatedly calls rendering code
function animate(timestamp) {
    ctx.clearRect(0, 0, view.width, view.height);
    // step 1: calculate time (time since start)
    let time = timestamp - start_time;

    // step 2: transform models based on time
    scene.models.forEach(currentModel => {
        if(currentModel.animation != null) {
            let rps = currentModel.animation.rps;
            let theta = (time / 1000) * (2 * Math.PI) * rps;
            let axis = currentModel.animation.axis;
            if(axis == 'x') {
                Mat4x4RotateX(currentModel.matrix, theta);
            } else if(axis == 'y') {
                Mat4x4RotateY(currentModel.matrix, theta);
            } else if(axis == 'z') {
                Mat4x4RotateZ(currentModel.matrix, theta);
            }
            let toOrigin = new Matrix(4,4);
            Mat4x4Translate(toOrigin, -currentModel.center.x, currentModel.center.y, currentModel.center.z);
            let backToCenter = new Matrix(4, 4);
            Mat4x4Translate(backToCenter, currentModel.center.x, currentModel.center.y, currentModel.center.z);
            currentModel.matrix = Matrix.multiply( [backToCenter, currentModel.matrix, toOrigin ] );
        }
    });

    // step 3: draw scene
    drawScene();

    // step 4: request next animation frame (recursively calling same function)
    // (may want to leave commented out while debugging initially)
    window.requestAnimationFrame(animate);
}

// Main drawing code - use information contained in variable `scene`
function drawScene() {
    console.log("SHOULD BE DRAWING SCENE");
    // clear previous frame
    //console.clear();
    ctx.clearRect(0, 0, view.width, view.height);

    let sceneType = scene.view.type;
    let modelLength = scene.models.length;
    let prp = scene.view.prp;
    let srp = scene.view.srp;
    let vup = scene.view.vup;
    let clip = scene.view.clip;

    let width = view.width;
    let height = view.height;

    let window = new Matrix(4, 4);
    window.values = [[ ( width / 2 ), 0, 0, ( width / 2 )],
                    [ 0, ( height / 2 ), 0, ( height / 2 )],
                    [ 0, 0, 1, 0],
                    [ 0, 0, 0, 1]];
    
    // For each model, for each edge

    let transform, project;

    if(sceneType == "perspective") {
        // perspective
        // general perspective projection: Nper = Sperh * SHpar * R * T(-PRP)   (09 - 3D Projections Part 2 slide 23)
        transform = mat4x4Perspective(prp, srp, vup, clip);
        project = mat4x4MPer();

    } else {
        // parallel or assumed parallel if not defined
        transform = mat4x4Parallel(prp, srp, vup, clip);
        project = mat4x4MPar();

        // general parallel projection: Npar = Spar * Tpar * SHpar * R * T(-PRP)    (09 - 3D Projections Part 2 slide 15)
    }

    // For each model, for each edge
    for(let i = 0; i < scene.models.length; i++) { // loop through all models
        let currentModel = scene.models[i];
        // transfcorm to canonical view volume
        let verts = []; // array to hold transformed vertices
        for(let j = 0; j < currentModel.vertices.length; j++) { // loop through the vertices in the current model            
            let tempVert = Matrix.multiply([ transform, currentModel.matrix, currentModel.vertices[j] ]);
            tempVert.x = tempVert.x / tempVert.w;
            tempVert.y = tempVert.y / tempVert.w;
            verts.push(tempVert);
        }        

        for(let j = 0; j < currentModel.edges.length; j++) { // loop through all edge arrays
            for(let k = 0; k < currentModel.edges[j].length - 1; k++) { // loop through vertex indices

                // assign two vertex indices
                let idx0 = currentModel.edges[j][k];
                let idx1 = currentModel.edges[j][k + 1];
                // assign two vertices using the indices
                let vert0 = verts[idx0];
                let vert1 = verts[idx1];

                // create a line between them to be clipped
                let tempLine = {pt0: vert0, pt1: vert1};

                // clip the line based on view type
                if(sceneType == "perspective") {
                    let z_min = -scene.view.clip[4] / scene.view.clip[5];
                    var clippedLine = clipLinePerspective( tempLine, z_min );
                } else {
                    var clippedLine = clipLineParallel( tempLine );
                }

                // draw the clipped line

                if (clippedLine != null) { // if line is null it was entirely out of view   
                    
                    // project to 2D
                    var drawPt0 = Matrix.multiply([ window, project, clippedLine.pt0 ]);
                    var drawPt1 = Matrix.multiply([ window, project, clippedLine.pt1 ]);
                    drawPt0.x = drawPt0.x / drawPt0.w;
                    drawPt0.y = drawPt0.y / drawPt0.w;
                    drawPt1.x = drawPt1.x / drawPt1.w;
                    drawPt1.y = drawPt1.y / drawPt1.w;
                    // draw 2D line
                    drawLine( ( drawPt0.x ), ( drawPt0.y ), ( drawPt1.x ), ( drawPt1.y ));

                }
            }
        }
    }

    

}

// Get outcode for vertex (parallel view volume)
function outcodeParallel(vertex) {
    let outcode = 0;
    if (vertex.x < (-1.0 - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (1.0 + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (-1.0 - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (1.0 + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (0.0 + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Get outcode for vertex (perspective view volume)
function outcodePerspective(vertex, z_min) {
    let outcode = 0;
    if (vertex.x < (vertex.z - FLOAT_EPSILON)) {
        outcode += LEFT;
    }
    else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {
        outcode += RIGHT;
    }
    if (vertex.y < (vertex.z - FLOAT_EPSILON)) {
        outcode += BOTTOM;
    }
    else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {
        outcode += TOP;
    }
    if (vertex.z < (-1.0 - FLOAT_EPSILON)) {
        outcode += FAR;
    }
    else if (vertex.z > (z_min + FLOAT_EPSILON)) {
        outcode += NEAR;
    }
    return outcode;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLineParallel(line) {
    let result = null;
    result = {
        pt0: Vector4(line.pt0.x, line.pt0.y, line.pt0.z, 1),
        pt1: Vector4(line.pt1.x, line.pt1.y, line.pt1.z, 1)
    };
    
    let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z);    
    let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
    let out0 = outcodeParallel(p0);
    let out1 = outcodeParallel(p1);

    if((out0 | out1) == 0) return line;

    // left: x = -1, right: x = 1, bottom: y = -1, top: y = 1, far: z = -1, near: z = 0

    let done = false;

    while(!done) {

        p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z);    
        p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
        out0 = outcodeParallel(p0);
        out1 = outcodeParallel(p1);
        done = (out0 | out1); // check for trivial accept

        if((out0 & out1) != 0) return null; // check for trivial reject

        // variable names selected to match powerpoints/notes
        let x0 = p0.x;
        let x1 = p1.x;
        let y0 = p0.y;
        let y1 = p1.y;
        let z0 = p0.z;
        let z1 = p1.z;
        let deltaX = x1-x0;
        let deltaY = y1-y0;
        let deltaZ = z1-z0;

        let outcode, selectedPoint;

        if (out0 != 0) {
            outcode = out0;
            selectedPoint = {x: x0, y: y0, z: z0};
        } else {
            outcode = out1;
            selectedPoint = {x: x1, y:y1, z: z1};
        }   

        // use parametric line equations to compute intersections
        // test for planes x = 1, x = -1, y = 1, y = -1, z = 0, z = -1
        /*
        parametric 3d line equations:
        x(t) = x0 + t(x1 - x0)
        y(t) = y0 + t(y1 - y0)
        z(t) = z0 + t(z1 - z0)
        */

        let x, y, z, t;

        if ((outcode & LEFT) != 0) { // clip to left plane
            t = ( -1 - x0 ) / ( deltaX );
        } else if ((outcode & RIGHT) != 0) { // clip to right plane
            t = ( 1 - x0 ) / ( deltaX );
        } else if ((outcode & BOTTOM) != 0) { // clip to bottom plane
            t = ( -1 - y0 ) / ( deltaY );
        } else if ((outcode & TOP) != 0) { // clip to top plane
            t = ( 1 - y0 ) / ( deltaY );
        } else if ((outcode & NEAR) != 0) { // clip to near plane
            t = ( -z0 ) / ( deltaZ );
        } else if ((outcode & FAR) != 0) { // clip to far plane
            t = ( -z0 - 1 ) / ( deltaZ );
        }
        
        x = (( 1 - t ) * p0.x ) + ( t * p1.x );
        selectedPoint.x = x;
        y = (( 1 - t ) * p0.y ) + ( t * p1.y );
        selectedPoint.y = y;
        z = (( 1 - t ) * p0.z ) + ( t * p1.z );
        selectedPoint.z = z;

        if(out0 != 0) {
            result.pt0.x = selectedPoint.x;
            result.pt0.y = selectedPoint.y;
            result.pt0.z = selectedPoint.z;
        } else {
            result.pt1.x = selectedPoint.x;
            result.pt1.y = selectedPoint.y;
            result.pt1.z = selectedPoint.z;
        }
    }
    return result;
}

// Clip line - should either return a new line (with two endpoints inside view volume) or null (if line is completely outside view volume)
function clipLinePerspective(line, z_min) {
    //console.log("clipLinePer");
    //console.log(line);
    let result = null;
    let p0 = Vector4(line.pt0.x, line.pt0.y, line.pt0.z, 1); 
    let p1 = Vector4(line.pt1.x, line.pt1.y, line.pt1.z, 1);
    let out0 = outcodePerspective(p0, z_min);
    let out1 = outcodePerspective(p1, z_min);

    let done = false;
    
    while(!done) {
        if((out0 | out1) == 0) {
            result = line; // trivial accept
            done = true;
            break;
        } else if((out0 & out1) != 0) {
            result = null; // trivial reject
            done = true;
            break;
        } else {
            // at least one endpoint is outside the view frustum
            var outcode, t, x , y, z = null;

            if (out0 != 0) {
                outcode = out0;
            } else {
                outcode = out1;
            }

            // declaring variables to avoid repetitive code
            let x0 = p0.x;
            let y0 = p0.y;
            let z0 = p0.z;
            let x1 = p1.x;
            let y1 = p1.y;
            let z1 = p1.z;
            let delX = x1 - x0;
            let delY = y1 - y0;
            let delZ = z1 - z0;

            if ((outcode & LEFT) != 0) { // clip to left edge
                t = (( -x0 + z0 ) / ( delX - delZ ));
            } else if ((outcode & RIGHT) != 0) { // clip to right edge
                t = (( x0 + z0 ) / ( -delX - delZ));
            } else if ((outcode & BOTTOM) != 0) { // clip to bottom edge
                t = (( -y0 + z0 ) / ( delY - delZ ));
            } else if ((outcode & TOP) != 0) { // clip to top edge
                t = (( y0 + z0 ) / ( -delY - delZ ));
            } else if ((outcode & NEAR) != 0) { // clip to near edge
                t = (( z0 - z_min ) / ( -delZ ));
            } else if ((outcode & FAR) != 0) { // clip to far edge
                t = (( -z0 - 1 ) / ( delZ ));
            }

            x = (( 1 - t ) * p0.x ) + ( t * p1.x );
            y = (( 1 - t ) * p0.y ) + ( t * p1.y );
            z = (( 1 - t ) * p0.z ) + ( t * p1.z );

            if (outcode === out0) { // if the point being clipped is p0, the selected outcode was out0

                p0.x = x;
                p0.y = y;
                p0.z = z;
                out0 = outcodePerspective(p0, z_min);

            } else { // otherwise the pt being clipped is p1 and the selected outcode was out1

                p1.x = x;
                p1.y = y;
                p1.z = z;
                out1 = outcodePerspective(p1, z_min);
                
            }

            line.pt0 = p0;
            line.pt1 = p1;
            result = line;

        }
    }
    return result;
}

// Called when user presses a key on the keyboard down 
function onKeyDown(event) {

    let n = scene.view.prp.subtract(scene.view.srp);
    n.normalize();
    let u = scene.view.vup.cross(n);
    u.normalize();
    let v = n.cross(u);
    v.normalize();

    let theta = Math.PI/8;
    let rot = new Matrix(3,3); // rotation matrix

    let costTheta = Math.cos(theta);
    let sinTheta = Math.sin(theta);

    let srp = scene.view.srp;
    let prp = scene.view.prp;
    
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            scene.view.srp = scene.view.srp.subtract(u);
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            scene.view.srp = scene.view.srp.add(u);
            break;
        case 65: // A key
            console.log("A");
            scene.view.prp = scene.view.prp.subtract(u);
            scene.view.srp = scene.view.srp.subtract(u);
            break;
        case 68: // D key
            console.log("D");
            scene.view.prp = scene.view.prp.add(u);
            scene.view.srp = scene.view.srp.add(u);
            break;
        case 83: // S key
            console.log("S");
            scene.view.prp = scene.view.prp.add(n);
            scene.view.srp = scene.view.srp.add(n);
            break;
        case 87: // W key
            console.log("W");
            scene.view.prp = scene.view.prp.subtract(n);
            scene.view.srp = scene.view.srp.subtract(n);
            break;
    
    }
    drawScene();
}

///////////////////////////////////////////////////////////////////////////////////
// SHAPE DRAWING FUNCTIONS                                                         //
///////////////////////////////////////////////////////////////////////////////////

/*
            {
                type: "cube",
                center: [4, 4, -10],
                width: 8,
                height: 8,
                depth: 8
            },

*/

function drawCube(center, width, height, depth, currentTheta, axis) {
    let vertices = [];
    let edges = [];
    let x = center[0];
    let y = center[1];
    let z = center[2];
    
    vertices.push(Vector4( x + ( width / 2 ), y + ( height / 2 ) , z + (depth / 2 ), 1 ));
    vertices.push(Vector4( x + ( width / 2 ), y + ( height / 2 ) , z - (depth / 2 ), 1 ));
    vertices.push(Vector4( x + ( width / 2 ), y - ( height / 2 ) , z + (depth / 2 ), 1 ));
    vertices.push(Vector4( x + ( width / 2 ), y - ( height / 2 ) , z - (depth / 2 ), 1 ));
    vertices.push(Vector4( x - ( width / 2 ), y + ( height / 2 ) , z + (depth / 2 ), 1 ));
    vertices.push(Vector4( x - ( width / 2 ), y + ( height / 2 ) , z - (depth / 2 ), 1 ));
    vertices.push(Vector4( x - ( width / 2 ), y - ( height / 2 ) , z + (depth / 2 ), 1 ));
    vertices.push(Vector4( x - ( width / 2 ), y - ( height / 2 ) , z - (depth / 2 ), 1 ));

    edges.push([0, 2, 3, 1, 0]); // draw square
    edges.push([4, 6, 7, 5, 4]); // draw square
    edges.push([0, 4]); // draw side
    edges.push([1, 5]); // draw side
    edges.push([2, 6]); // draw side
    edges.push([3, 7]); // draw side
    
    
    //console.log(edges);


    // draw cube
    return([vertices, edges]);
}

function drawCone(centerPointOfBase, radius, height, sides) {
    let vertices = [];
    let edges = [];
    let incrementAngle = 2 * Math.PI / sides;
    let xCenter = centerPointOfBase[0];
    let yCenter = centerPointOfBase[1];
    let zCenter = centerPointOfBase[2];    

    // circle
    for(let i = 0; i <= sides; i++) {
        let x = Math.cos( incrementAngle * i ) * radius + xCenter;
        let y = yCenter;
        let z = Math.sin( incrementAngle * i ) * radius + zCenter;
        let coordinate = Vector4(x, y, z, 1);
        vertices.push(coordinate);
    }
    console.log("end of circle loop");
    // peak of cone
    vertices.push(Vector4(xCenter, yCenter + height, zCenter, 1));

    // lines between vertices for circle
    for(let i = 0; i < sides; i++) {
        edges.push([i, i+1]);
    }
    // lines to peak
    for(let i = 0; i < sides; i++) {
        edges.push([i, vertices.length - 1]); // peak is last value in vertices
    }
    
    return([vertices, edges]);
}

function drawCylinder(center, radius, height, sides) {
    let vertices = [];
    let edges = [];
    let xCenter = center[0];
    let yCenter = center[1];
    let zCenter = center[2];
    let incrementAngle = 2 * Math.PI / sides;

    // bottom circle, so height is - height / 2
    for(let i = 0; i < sides; i++) {
        let x = Math.cos( incrementAngle * i ) * radius + xCenter;
        let y = yCenter - ( height / 2 );
        let z = Math.sin( incrementAngle * i ) * radius + zCenter;
        let coordinate = Vector4(x, y, z, 1);
        vertices.push(coordinate);
    }
    // top circle, so height is + height / 2
    for(let i = 0; i < sides; i++) {
        let x = Math.cos( incrementAngle * i ) * radius + xCenter;
        let y = yCenter + ( height / 2 );
        let z = Math.sin( incrementAngle * i ) * radius + zCenter;
        let coordinate = Vector4(x, y, z, 1); //one is for homogeneous coordinates
        vertices.push(coordinate);
    }
    // vertices = [circle0, circle0... circle1, circle1...]
    /*
            edges = [
                [bottom circle],
                [top circle],
            ]
    */

    // lines between vertices of bottom circle
    for(let i = 0; i < sides - 1; i++) {
        // [bottom0, bottom1, top0, top1]
        edges.push([i, i + 1, i + sides + 1, i + sides]); // push a rectangle that forms the side
    }
    edges.push([sides - 1, 0, sides, sides * 2 - 1]); // close off bottom circle and top circle
    
    return([vertices, edges]);
}

function drawSphereBetter(center, radius, slices, stacks) {
    console.log("SHOULD SEE SPHERE");
    let vertices = [];
    let edges = [];
    
    stacks = 25;
    slices = 25;
    // spherical coordinates: r, theta, phi
    // theta: [0, pi]
    // phi: [0, 2pi]

    let sliceAngle = Math.PI / slices;
    let stackAngle = 2 * Math.PI / stacks;

    // for(let i = 0; i < stacks + 1; i++) {
    //     let phi = i * stackAngle;
    //     for(let j = 0; j < slices; j++) {
    //         let theta = j * sliceAngle;
    //         let x = center[0] + radius * Math.cos(theta) * Math.sin(phi);
    //         let y = center[1] + radius * Math.cos(phi);
    //         let z = center[2] + radius * Math.sin(phi) * Math.sin(theta);
    //         let point = Vector4(x, y, z, 1);
    //         vertices.push(point);
    //     }
    // }

    // for(let i = 0; i < stacks; i++) {
    //     for(let j = 0; j < slices; j++) {
    //         edges.push([slices * i + j, slices * (i + 1) + j]);
    //         edges.push([slices * i + j, slices * i + j + 1]);
    //     }
    // }

    let dTheta = Math.PI / stacks;
    let dPhi = 2 * Math.PI / slices;
    let theta, phi = 0;
    // x = r cos(phi) sin(theta)
    // y = r sin(phi) sin(theta)
    // z = r cos(theta)
    for(let i = 0; i < stacks + 1; i++) { // needs i < stacks + 1 to close circles
        let phi = i * dPhi; // go around from 0 to 2pi
        // generate one slice of vertices
        for(let j = 0; j < slices; j++) {
            let theta = j * dTheta; // go up and down at each stack from 0 to pi
            // each value is center in cartesian plus conversion from spherical coordinates
            let x = center[0] + ( radius * Math.cos(phi) * Math.sin(theta) );
            let y = center[1] + ( radius * Math.sin(phi) * Math.sin(theta) );
            let z = center[2] + ( radius * Math.cos(theta) );
            let point = Vector4(x, y, z, 1);
            vertices.push(point);
            theta += dTheta;
        }
        console.log("ONE SLICE:", vertices, vertices.length);
    }

    for(let i = 0; i < stacks; i++) { // going around full circles
        for(let j = 0; j < slices; j++) { // half circles
            // each iteration of the inner loop needs to be offset by iterations of outer loop
            // draw from current stack to next stack AND draw from current slice to next slice
            let offset = slices * i;
            edges.push( [ offset + j, slices * (i + 1) + j] ); // slices
            edges.push( [ offset + j, slices * (i)] ); // stacks
        }
    }

    return([vertices,edges]);
}

function drawSphere(center, radius, slices, stacks) {
    stacks = 15;
    slices = 15;
    let vertices = [];
    let edges = [];
    let sides = 25;


    // work in spherical coordinates instead of cartesian
    // stacks
    for(let i = 0; i < stacks; i++) {
        // get radius based on current height
        let currentHeight = i / stacks * radius * 2 - radius;
        let angle = Math.acos(currentHeight / radius);
        let currentRadius = Math.tan(angle) * currentHeight;
        if(currentRadius == 0) currentRadius = radius; // get middle circle to draw
        let circleCenter = [center[0], center[1] + currentHeight, center[2]];
        drawStackCircle(circleCenter, currentRadius, sides, vertices, edges);
    }

    // slices
    for(let i = 0; i < slices; i++) {
        // get radius based on current depth
        let currentDepth = i / slices * radius * 2 - radius;
        let angle = Math.acos(currentDepth / radius);
        let currentRadius = Math.tan(angle) * currentDepth;
        if(currentRadius == 0) currentRadius = radius; // get middle circle to draw
        let circleCenter = [center[0], center[1], center[2] + currentDepth];
        drawSliceCircle(circleCenter, currentRadius, sides, vertices, edges);
    }
    return([vertices,edges]);
}

function drawStackCircle(center, radius, sides, vertices, edges) {
    let offset = vertices.length;

    // circle vertices
    for(let i = 0; i < sides; i++) {
        let x = Math.cos(2 * i * Math.PI / sides) * radius + center[0];
        let z = Math.sin(2 * i * Math.PI / sides) * radius + center[2];
        vertices.push(Vector4(x, center[1], z, 1));
    }
    // circle edges
    let circleEdges = [];
    for(let i = offset; i < offset + sides; i++) {
        circleEdges.push(i);
    }
    circleEdges.push(offset);
    edges.push(circleEdges);
}

function drawSliceCircle(center, radius, sides, vertices, edges) {
    let offset = vertices.length;

    // circle vertices
    for(let i = 0; i < sides; i++) {
        let x = Math.cos(2 * i * Math.PI / sides) * radius + center[0];
        let y = Math.sin(2 * i * Math.PI / sides) * radius + center[1];
        vertices.push(Vector4(x, y, center[2], 1));
    }
    // circle edges
    let circleEdges = [];
    for(let i = offset; i < offset + sides; i++) {
        circleEdges.push(i);
    }
    circleEdges.push(offset);
    edges.push(circleEdges);
}

function createModelVertsAndEdges() {
    for(let modelIdx = 0; modelIdx < scene.models.length; modelIdx++) {
        let currentModel = scene.models[modelIdx];
        if(currentModel.type == "cube") {
            let output = drawCube(currentModel.center, currentModel.width, currentModel.height, currentModel.depth, 0.0, 0.0);
            // output of drawCube is [vertices, edges]
            currentModel.vertices = output[0];
            currentModel.edges = output[1];
        } else if(currentModel.type == "cone") {
            console.log("cone");
            let output = drawCone(currentModel.center, currentModel.radius, currentModel.height, currentModel.sides, 0.0, 0.0);
            currentModel.vertices = output[0];
            currentModel.edges = output[1];
        } else if(currentModel.type == "cylinder") {
            let output = drawCylinder(currentModel.center, currentModel.radius, currentModel.height, currentModel.sides);
            currentModel.vertices = output[0];
            currentModel.edges = output[1];
        } else if(currentModel.type == "sphere") {
            let output = drawSphere(currentModel.center, currentModel.radius, currentModel.slices, currentModel.stacks);
            //let output = drawSphereBetter(currentModel.center, currentModel.radius, currentModel.slices, currentModel.stacks);
            currentModel.vertices = output[0];
            currentModel.edges = output[1];
        }
    }
}

///////////////////////////////////////////////////////////////////////////
// No need to edit functions beyond this point
///////////////////////////////////////////////////////////////////////////

// Called when user selects a new scene JSON file
function loadNewScene() {
    let scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    let reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);
        scene.view.srp = Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
            scene.models[i].matrix = new Matrix(4, 4);
        }
        createModelVertsAndEdges();
    };
    reader.readAsText(scene_file.files[0], 'UTF-8');
}

// Draw black 2D line with red endpoints 
function drawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}