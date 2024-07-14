let stages = [];
let staticOrbits = [];

console.log('orbitalSystemMap.js called...');

//set up pattern canvas.

{
    // Define stripe parameters
    const stripeWidth = 1; // Width of each stripe
    const stripeHeight = 1; // Height of each stripe (one color segment)
    const patternWidth = stripeWidth; // Total pattern width (equal to stripe width for vertical stripes)
    const patternHeight = stripeHeight * 4; // Total pattern height (two segments: one colored, one transparent)

    // Create a canvas for the pattern
    var konva_pattern_stripes = document.createElement('canvas');
    konva_pattern_stripes.width = patternWidth;
    konva_pattern_stripes.height = patternHeight;
    var patternContext = konva_pattern_stripes.getContext('2d');


    // Draw the pattern: alternating colored and transparent stripes
    patternContext.fillStyle = 'rgb(255, 176, 0)';
    patternContext.fillRect(0, 0, patternWidth, stripeHeight); // Top half colored
    patternContext.clearRect(0, stripeHeight, patternWidth, stripeHeight); // Bottom half transparent

}

//{
//        // Define dot parameters
//    const dotRadius = 2.5; // Radius of each dot
//    const patternWidth = 200; // Total pattern width (higher resolution)
//    const patternHeight = 200; // Total pattern height (higher resolution)
//    const dotDensity = 0.01; // Density of the dots, 0.1 means 10% of the area will have dots
//
//    // Create a canvas for the pattern
//    var konva_pattern_dots = document.createElement('canvas');
//    konva_pattern_dots.width = patternWidth;
//    konva_pattern_dots.height = patternHeight;
//    var patternContext = konva_pattern_dots.getContext('2d');
//
//    // Draw the pattern: random small dots
//    patternContext.fillStyle = 'rgb(255, 176, 0)';
//
//    for (let x = 0; x < patternWidth; x++) {
//        for (let y = 0; y < patternHeight; y++) {
//            if (Math.random() < dotDensity) {
//                patternContext.beginPath();
//                patternContext.arc(x, y, dotRadius, 0, 2 * Math.PI);
//                patternContext.fill();
//            }
//        }
//    }
//}


document.addEventListener('typer_done', function(event) {
    console.log('Listener 1: typer_done');
    orbitalSystemMap_main(true);
});


function orbitalSystemMap_main(finalPass=false) {

    // Get all elements with id="orbitalSystemMap"
    const orbitalSystemMaps = document.querySelectorAll('#display #orbitalSystemMap');
    //let stage = new Konva.Stage();
    //let layer = new Konva.Layer();


    // If there are no elements with id="orbitalSystemMap"
    if (orbitalSystemMaps.length === 0) {
        console.log('No elements with id "orbitalSystemMap" found.');
        // Add any additional logic here
        //return; // Exit the function early if no elements are found
    }

    // Iterate over each element
    orbitalSystemMaps.forEach((element, index) => {

        try {
            // Parse the content of the element as JSON
            
            // strip any garbage at the end
            let elementText = element.textContent;

            //console.log("original: ",elementText);

            elementText = elementText.substring(0, elementText.lastIndexOf('}') + 1);
            
            //console.log("stripped: ",elementText);

            staticOrbits[index] = JSON.parse(elementText);
        } catch (error) {
            console.error(`Failed to parse JSON for element at index ${index}:`, error);
            return; // Skip this iteration if JSON parsing fails
        }

        
        //const stage = new Konva.Stage({container: 'orbitalSystemMap'});
        stages[index] = new Konva.Stage({container: element});
        
        //stages[index].destroyChildren();
        //var layer = new Konva.Layer();
        //stages[index].add(layer);

        //console.log("staticOrbits: ",staticOrbits[index]);
        //console.log("stage: ",stages[index]);
        
        //renderOrbits(layer,staticOrbits[index]);
        renderOrbits(staticOrbits[index]);
        stages[index].add(staticOrbits[index].layer);
        adTimeLabel(staticOrbits[index],0)
        //layer.draw();
        element.style.display = ''; //remove style="display:none;"
        
    });


    const animation = new Konva.Animation(function(frame) {

        //return;
        
        stages.forEach(function (stage, index) {
            //layer.clear();
            //renderOrbits(staticOrbits,frame.time / 1500)
            //layer.draw();
                //stage.removeChildren();
            //stage.destroyChildren();
                //var layer = new Konva.Layer();
                //stage.add(layer);
            renderOrbits(staticOrbits[index],frame.time*8640*0.5);
            adTimeLabel(staticOrbits[index],frame.time*8640*0.5)
            scaleStage();
            //layer.draw();
            });
    });
    //animation.start();

    // Call scaleStage function initially and on window resize
    scaleStage();
    window.addEventListener('resize', scaleStage);

    //animate the reveal, and restart the typewriter if necessary
    if (finalPass) {
        //if this is the final pass complete the last stage and start the animation.
        //startRevealAnimation(stages[stages.length-1],50,() => {animation.start();});
        startRevealAnimation(stages,70,() => {animation.start();});
        //startRevealAnimation(stages,60,() => {});
    } else {
        //if this is a mid document stop
        //animate the reveal, then restart the typewriter after.
        //startRevealAnimation(stages,50,() => {console.log("animation done");});
        //console.log("stages[stages.length-1] : ", stages[stages.length-1])
        startRevealAnimation(stages,70,() => {typeWriter();});
        //startRevealAnimation(stages[stages.length-1],50,() => {typeWriter();});
    }
}



//"load-in" animation reveals one shape at a time.
function startRevealAnimation(stages, interval, onComplete) {

    // Ensure stages is an array
    if (!Array.isArray(stages)) {
        stages = [stages];
    }

    // Build a list of all shapes from all stages
    let shapes = [];
    stages.forEach(stage => {
        const layer = stage.children[0]; // Assuming there's only one layer
        
        const collection = layer.getChildren(); // Get Konva.Collection
        //console.log("collection: ",collection);
        // Convert Konva.Collection to array
        for (let i = 0; i < collection.length; i++) {
            shapes.push(collection[i]); // Push each shape into the array
        }
        
        
        //shapes = shapes.concat(layer.getChildren()); // Get all shapes in the layer and add to the list
        //console.log("layer.getChildren: ",layer.getChildren());
    });

    console.log("shapes: ", shapes);


    //const layer = stage.children[0]; // Assuming there's only one layer
    //const shapes = layer.getChildren(); // Get all shapes in the layer
    
    //makes all shapes in the list hidden.
    shapes.forEach(function (shape, index) {
        //shape.opacity(0);
        shape.visible(false);
    });
    stages.forEach(stage => {stage.batchDraw();});

    //recurse over the list with a delay, and reveal each shape in turn.
    revealElementsRecursive(shapes, 0, interval, onComplete);
}



 // Function to reveal elements one by one in a stage
 function revealElementsRecursive(elements, index, interval, onComplete) {
    if (index >= elements.length) {
        onComplete();
        return;
    }

    const shape = elements[index];
    //shape.opacity(1); // Snap to visible
    shape.visible(true);
    shape.getLayer().batchDraw(); // Redraw the layer to reflect the change

    setTimeout(() => {
        revealElementsRecursive(elements, index + 1, interval, onComplete);
    }, interval);
}


//renders orbits
function renderOrbits(orbits, time = 0, offset = {"x":0,"y":0},layer){

    var addToLayer = false;

    if (orbits.layer===undefined) {
        if (layer===undefined) {
        orbits.layer = new Konva.Layer();
        orbits.layer.listening(false);
        } else {
            orbits.layer = layer;
        }

        addToLayer = true;
    }

    //draw each static orbit
    for (let key in orbits) {

        //console.log(key, orbits[key]);

        // fill in missing data:
        if (orbits[key].label===null || orbits[key].label === undefined) { orbits[key].label = ""; }
        if (orbits[key].icon_r===null || orbits[key].icon_r === undefined) { orbits[key].icon_r = 0; }
        if (orbits[key].icon_type===null || orbits[key].icon_type === undefined) { orbits[key].icon_type = ""; }
        if (orbits[key].orbit_w===null || orbits[key].orbit_w === undefined) { orbits[key].orbit_w = 0; }
        if (orbits[key].orbit_type===null || orbits[key].orbit_type === undefined) { orbits[key].orbit_type = ""; }
        if (orbits[key].period===null || orbits[key].period === undefined) { orbits[key].period = 0; }
        if (orbits[key].period_offset===null || orbits[key].period_offset === undefined) { orbits[key].period_offset = 0; }

        if ((orbits[key].minor_axis===null || orbits[key].minor_axis === undefined) 
            && (orbits[key].major_axis===null || orbits[key].major_axis === undefined))
            { orbits[key].major_axis = 0; }

        if (orbits[key].minor_axis===null || orbits[key].minor_axis === undefined) { orbits[key].minor_axis = orbits[key].major_axis; }
        if (orbits[key].major_axis===null || orbits[key].major_axis === undefined) { orbits[key].major_axis = orbits[key].minor_axis; }
        if (orbits[key].focal_axis_offset===null || orbits[key].focal_axis_offset === undefined) { orbits[key].focal_axis_offset = 0; }
        if (orbits[key].satellites===null || orbits[key].satellites === undefined) { orbits[key].satellites = {}; }
        
        if (orbits[key].label!==""  && orbits[key].icon_type==="")
            { orbits[key].icon_type = "fill"; }


        //calculate offsets
        let new_offset = getPositionFromOrbit(orbits[key],time);
        total_offset = {"x":0,"y":0};
        total_offset.x = offset.x + new_offset.x;
        total_offset.y = offset.y + new_offset.y;



        if (typeof orbits[key].orbit_w === 'number' && orbits[key].orbit_w > 0) {
            //render the orbit
            var konva_orbit = getEllipseFromOrbit(orbits[key],time);
            konva_orbit.x(100+offset.x);
            konva_orbit.y(0+offset.y);
            orbits.layer.add(konva_orbit);
        }

        if (typeof orbits[key].icon_r === 'number' && orbits[key].icon_r > 0) {
            //render the icon
            var konva_icon = getIconFromOrbit(orbits[key],time);
            konva_icon.x(100+total_offset.x);
            konva_icon.y(0+total_offset.y);
            orbits.layer.add(konva_icon);
        }

        if (typeof orbits[key].label === 'string' && orbits[key].label.trim() !== '') {
            //render label (is present)
            var konva_label = getLabelFromOrbit(orbits[key],time);
            konva_label.x(100+total_offset.x);
            konva_label.y(0+total_offset.y);
        }
        
        //recursively iterate over satellites
        if (orbits[key].satellites && Object.keys(orbits[key].satellites).length > 0) {
            //console.log("Recursing...");
            renderOrbits(orbits[key].satellites,time,total_offset,orbits.layer);
        }

        //add the satellites first so the parent object is rendered on top
        if (addToLayer) {

            if (typeof orbits[key].orbit_w === 'number' && orbits[key].orbit_w > 0) {
                //add the orbit
                //orbits.layer.add(konva_orbit);
            }

            if (typeof orbits[key].icon_r === 'number' && orbits[key].icon_r > 0) {
                //add the icon
                //orbits.layer.add(konva_icon);
            }

            if (typeof orbits[key].label === 'string' && orbits[key].label.trim() !== '') {
                //add label (is present)
                orbits.layer.add(konva_label);
            }
        }

    }

    ////reorder all elements in layer so groups (things with backgrounds) are on top
    //layer.getChildren().forEach((shape) => {
    //    if (shape instanceof Konva.Group) {
    //      shape.moveToTop();
    //    }
    //  });

    ////reorder all elements in layer so Rect are on top.
    //layer.getChildren().forEach((shape) => {
    //    if (shape instanceof Konva.Rect) {
    //      shape.moveToTop();
    //    }
    //    console.log(shape);
    //  });
    //
    ////reorder all elements in layer so Text are on top.
    //  layer.getChildren().forEach((shape) => {
    //      if (shape instanceof Konva.Text) {
    //        shape.moveToTop();
    //      }
    //    });
    //
    //cache and apply blur on entire layer
    //layer.cache();
    // Apply the blur filter to the layer
    //layer.filters([Konva.Filters.Blur]);
    //layer.blurRadius(0.001); // Set the blur radius

} 







// Function to scale stage based on screen width
function scaleStage() {
    const initialScreenWidth = 200;  // Example: base screen width


    stages.forEach(function (stage, index) {
        const container = stage.container();
        const containerWidth = container.offsetWidth;  // Use the container width for scaling
        const documentWidth = document.documentElement.clientWidth;  // Use the document width for scaling

        //console.log("documentWidth: ", documentWidth);
        //console.log("window.innerWidth: ", window.innerWidth);


    let width = documentWidth;
    //let width = window.innerWidth;
    let scale = width / initialScreenWidth;  // Calculate scale factor based on initial screen width

    //console.log("stage.width: ", stage.width());
    //console.log("scale: ", scale);

    stage.scaleX(scale);  // Apply scale to X axis
    stage.scaleY(scale);  // Apply scale to Y axis
    stage.width(width);
    //stage.width(containerWidth);
    //stage.height(window.innerHeight);

    // Calculate the height to fit the content
    let maxHeight = 0;
    stage.find('Shape').forEach((shape) => {
        const shapeHeight = shape.y() + shape.height() * shape.scaleY();
        if (shapeHeight > maxHeight) {
            maxHeight = shapeHeight;
        }
        //console.log("shape.y(): ",shape.y(), " shape.height(): ",shape.height(), " shape.scaleY(): ",shape.scaleY())
    });

    //Add margin
    maxHeight += 20; 
    
    let offset_y = (maxHeight/2);
    
    //console.log("scale", scale, " maxHeight: ",maxHeight, " offset_y: ", offset_y);
    
    // Set the stage height to fit the content
    stage.height(maxHeight*scale);

    // Adjust the position of each layer to center the content vertically
    stage.children.forEach((layer) => {
        layer.y(offset_y);
    });
    

    //stage.draw();  // Redraw the stage
    stage.batchDraw();  // Redraw the stage

    });
}





//creates Konva.Ellipse from orbit data
function getEllipseFromOrbit(orbitParams,time) {
    let { orbit_w, orbit_type, major_axis, minor_axis, focal_axis_offset, period, period_offset} = orbitParams;

    //let orbitParams.konva_object_orbit={};

    if (orbit_type==="ring") {

        if (orbitParams.konva_object_orbit===undefined){
            orbitParams.konva_object_orbit = new Konva.Ring({
                preventDefault: false,
                listening: false,
                perfectDrawEnabled: false,
                outerRadius: major_axis + 0.5*orbit_w,
                innerRadius: major_axis - 0.5*orbit_w,
                stroke: "rgb(255, 176, 0)",
                //fill: "rgb(255, 176, 0)",

                fillPatternImage: konva_pattern_stripes,
                fillPatternRepeat: 'repeat',

                shadowColor: "rgb(255, 176, 0)",
                shadowBlur: 0.3,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                strokeWidth: 0.4,
                rotation: -45
            });
        }
        
    } 
    
    else if (orbit_type==="belt") {

        //divide the belt into multiple rings
        let numberOfRingDivisions = orbit_w/1;

        let newWidth = orbit_w/numberOfRingDivisions;
        let oldMinRadius = major_axis - 0.5*orbit_w;
        let oldMaxRadius = major_axis + 0.5*orbit_w;

        if (orbitParams.konva_object_orbit===undefined){

            //create the orbitals
            orbitParams.konva_object_orbit = new Konva.Group({});
            
            for (let i = 0; i < numberOfRingDivisions; i++) {
                let newRadius = oldMaxRadius - (i * newWidth);
                orbitParams.konva_object_orbit.add(beltRing(newRadius,newWidth));

            }
        }

        //update the rotation of the orbitals
        for (let i = 0; i < numberOfRingDivisions; i++) {
            let newRadius = oldMaxRadius - (i * newWidth);
            
            //use keplers third law to create new periods from the new radius
            let newPeriod = period * Math.pow(newRadius / major_axis, 3 / 2);

            let rot = 0;
            //scale time to days
            let days = time / 864000;

            if (period!==0) {
                //rot = (((-days + period_offset)/newPeriod)*360)%360;
                rot = (((-days + period_offset)/newPeriod)*360)%360;
                //console.log("rot: ",rot);
            }

            orbitParams.konva_object_orbit.getChildren()[i].rotation(rot);

        }
    }
    else {

        // Calculate the distance to the focal point
        const c = Math.sqrt(Math.pow(major_axis, 2) - Math.pow(minor_axis, 2));

        if (orbitParams.konva_object_orbit===undefined){
            
            // Create and return the Konva.Ellipse
                orbitParams.konva_object_orbit = new Konva.Ellipse({
                preventDefault: false,
                listening: false,
                perfectDrawEnabled: false,
                x: 0,  // Initial position, can be updated later
                y: 0,  // Initial position, can be updated later
                //x: stage.width() / 2,
                //y: stage.height() / 2,
                radiusX: major_axis,
                radiusY: minor_axis,
                stroke: "rgb(255, 176, 0)",
                shadowColor: "rgb(255, 176, 0)",
                shadowBlur: 0.3,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                //dashEnabled: true,
                //dash: [1, 1],
                strokeWidth: orbit_w,
                rotation: focal_axis_offset,  // Apply the rotation
                offset: {
                    x: c,  // Offset to rotate around the right focal point
                    y: 0
                }
            });
        }

        //no animation sim orbits 
        //orbitParams.konva_object_orbit.offset={x: c, y: 0};
    }


    orbitParams.konva_object_orbit = orbitParams.konva_object_orbit;
    return orbitParams.konva_object_orbit;
}


function beltRing(radius,width){
    let beltRing = new Konva.Ring({
        preventDefault: false,
        listening: false,
        perfectDrawEnabled: false,
        outerRadius: radius + 0.5*width,
        innerRadius: radius - 0.5*width,
        //stroke: "rgb(255, 176, 0)",
        //fill: "rgb(255, 176, 0)",

        //fillPatternImage: konva_pattern_dots_image,
        //fillPatternImage: konva_pattern_dots,
        //fillPatternRepeat: 'repeat',

        shadowColor: "rgb(255, 176, 0)",
        shadowBlur: 0.3,
        //shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        //strokeWidth: 0.4,
        //rotation: rot
    });
    
    //create group 
    //UPDATE_TAG
    let beltGroup = new Konva.Group({});
    beltGroup.add(beltRing);

    //generate the asteroids, add them to the group
    let area = 3.1415 * (Math.pow(beltRing.outerRadius(),2) - Math.pow(beltRing.innerRadius(),2));
    let numberOfDots = Math.round(area*0.08);

    //console.log ("numberOfDots: ", numberOfDots)

    for (var i = 0; i < numberOfDots; i++) {

        
        //random numbers for this run
        var random_1 = integerToRandomNumber(i+radius);
        var random_2 = integerToRandomNumber(i+radius*2+1+numberOfDots*2);
        var random_3 = integerToRandomNumber(i+radius*4+2+numberOfDots*4);
        var random_4 = integerToRandomNumber(i+radius*6+3+numberOfDots*6);
        var random_4 = integerToRandomNumber(i+radius*8+4+numberOfDots*8);

        var r = (random_4-0.25)*0.4 + 0.4;

        let dot = new Konva.Circle({
            preventDefault: false,
            listening: false,
            perfectDrawEnabled: false,
            radius: 0.4,
            //radius: r,
            fill: "rgb(255, 176, 0)",
            shadowColor: "rgb(255, 176, 0)",
            shadowBlur: 0.3,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
        });

        // start in the middle of the ring
        //var angle = (((Math.random()-0.5)*1.5 + i) / numberOfDots) * Math.PI * 2;
        var angle = (((random_1+random_2-1)*2.5 + i) / numberOfDots) * Math.PI * 2;
        //var x = (beltRing.x() + ((beltRing.innerRadius() + beltRing.outerRadius()) / 2) * Math.cos(angle));
        //var y = (beltRing.y() + ((beltRing.innerRadius() + beltRing.outerRadius()) / 2) * Math.sin(angle));
        var x = (((beltRing.innerRadius() + beltRing.outerRadius()) / 2) * Math.cos(angle));
        var y = (((beltRing.innerRadius() + beltRing.outerRadius()) / 2) * Math.sin(angle));

        //offset in random direction
        //var angle = Math.random() * Math.PI * 2;
        //var offsetLength = Math.random() * (width*4);
        //var angle = random_2 * Math.PI * 2;
        var offsetLength = (random_3+random_4-0.5) * (width*3);
        x += offsetLength * Math.cos(angle);
        y += offsetLength * Math.sin(angle);

        dot.x(x);
        dot.y(y);

        beltGroup.add(dot);

    }


    return beltGroup;
}


function integerToRandomNumber(integer) {
    integer = integer ^ (integer << 10);
    integer = integer ^ (integer >> 15);
    integer = integer ^ (integer << 4);
    integer = integer * 3323198485;
    integer = integer ^ (integer >> 16);
    return (integer >>> 0) / (4294967296); // Normalize to [0, 1]
}

//creates icon from orbit data
function getIconFromOrbit(orbitParams,time) {
    let { major_axis, minor_axis, focal_axis_offset, icon_r, icon_type } = orbitParams;

    // Calculate the distance to the focal point
    //const c = Math.sqrt(Math.pow(major_axis, 2) - Math.pow(minor_axis, 2));


    if (orbitParams.konva_object_icon===undefined){

        orbitParams.konva_object_icon = new Konva.Group({});

        //star * - Navigation point
        if (icon_type==="triangle"||icon_type==="triangle2"
            ||icon_type==="diamond"||icon_type==="diamond2"
            ||icon_type==="square"||icon_type==="pentagon"||icon_type==="hexagon"
            ||icon_type==="heptagon"||icon_type==="octagon") {

            var sides = 3;
            if (icon_type==="triangle"||icon_type==="triangle2") {sides = 3;}
            if (icon_type==="diamond"||icon_type==="diamond2") {sides = 4;}
            if (icon_type==="square") {sides = 4;}
            if (icon_type==="pentagon") {sides = 5;}
            if (icon_type==="hexagon") {sides = 6;}
            if (icon_type==="heptagon") {sides = 7;}
            if (icon_type==="octagon") {sides = 8;}

            var rot = 0;
            if (icon_type==="square") {rot = 45;}
            if (icon_type==="triangle2") {rot = 180;}

            
            var scale = 1;
            var width = 0.4;
            if (icon_type==="diamond2") {scale = 0.707; width = 0.5;}

            // add background
            orbitParams.konva_object_icon.add(
                new Konva.RegularPolygon({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    lineJoin: "miter",
                    
                    radius: icon_r+1,
                    sides: sides,
                    rotation: rot,
                    scaleX: scale,

                    strokeWidth: 0,
                    fill: "rgb(20, 20, 220)",
                    globalCompositeOperation: 'destination-out'
                })
            );

            // add shape
            orbitParams.konva_object_icon.add(
                new Konva.RegularPolygon({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    stroke: "rgb(255, 176, 0)",
                    strokeWidth: width,
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    lineJoin: "miter",
                    
                    radius: icon_r,
                    sides: sides,
                    rotation: rot,
                    scaleX: scale,
                })
            );
        }

        //v
        else if (icon_type==="v") {
            orbitParams.konva_object_icon.add(
                new Konva.Circle({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    radius: 0.4,
                    fill: "rgb(255, 176, 0)",
                    shadowColor: "rgb(255, 176, 0)",
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                })

            );
            orbitParams.konva_object_icon.add(
                new Konva.Line({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    stroke: "rgb(255, 176, 0)",
                    strokeWidth: 0.4,
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    points: [icon_r*0.5,-0.8-icon_r*0.866,0,-0.8],
                })
            );

            orbitParams.konva_object_icon.add(
                new Konva.Line({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    stroke: "rgb(255, 176, 0)",
                    strokeWidth: 0.4,
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    points: [0,-0.8,-icon_r*0.5,-0.8-icon_r*0.866],
                })
            );
        }


        //star * - Navigation points?
        else if (icon_type==="star"||icon_type==="star1"||icon_type==="star2") {

            var triStar_up = 1;
            var triStar_down = 1;

            if (icon_type==="star1") {triStar_up = 0;}
            if (icon_type==="star2") {triStar_down = 0;}

            orbitParams.konva_object_icon.add(
                new Konva.Line({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    stroke: "rgb(255, 176, 0)",
                    strokeWidth: 0.4,
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    points: [0,-icon_r*triStar_down,0,icon_r*triStar_up],
                })
            );

            orbitParams.konva_object_icon.add(
                new Konva.Line({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    stroke: "rgb(255, 176, 0)",
                    strokeWidth: 0.4,
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    points: [icon_r*0.866*triStar_up,-icon_r*0.5*triStar_up,-icon_r*0.866*triStar_down,icon_r*0.5*triStar_down],
                })
            );

            orbitParams.konva_object_icon.add(
                new Konva.Line({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    stroke: "rgb(255, 176, 0)",
                    strokeWidth: 0.4,
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    points: [icon_r*0.866*triStar_down,icon_r*0.5*triStar_down,-icon_r*0.866*triStar_up,-icon_r*0.5*triStar_up],
                })
            );
        }

        //squat diamond 
        else if (icon_type==="diamond1") {}
        
        //tall diamond 
        else if (icon_type==="diamond2") {}

        //square  
        else if (icon_type==="square") {}

        //triangle  
        else if (icon_type==="triangle") {}

        else {

            // Add background
            orbitParams.konva_object_icon.add(
                new Konva.Circle({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    radius: icon_r+1,
                    strokeWidth: 0,
                    fill: "rgb(20, 20, 220)",
                    globalCompositeOperation: 'destination-out'
                })
            );

            // Add icon
            orbitParams.konva_object_icon.add(
                new Konva.Circle({
                    //x: 0,  // Initial position, can be updated later
                    //y: 0,  // Initial position, can be updated later
                    //x: (stage.width() / 2)+major_axis,
                    //x: stage.width() / 2,
                    //y: stage.height() / 2,
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    radius: icon_r,
                    stroke: "rgb(255, 176, 0)",
                    strokeWidth: 0.4,
                    //strokeWidth: 0,
                    //fill: "rgb(255, 176, 0, 0)",
                    //fill: "rgb(255, 176, 0)",
                    shadowColor: "rgb(255, 176, 0)",
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    //rotation: -45,
                    //globalCompositeOperation: 'destination-out'
                })
            )

            //fill
            if (icon_type==="fill") {
            orbitParams.konva_object_icon.getChildren()[1].fill('rgb(255, 176, 0)'); 
            }

            //stripe
            if (icon_type==="stripe") {
                //console.log("!!!icon_type: ",icon_type);
                orbitParams.konva_object_icon.getChildren()[1].fill(null);
                orbitParams.konva_object_icon.getChildren()[1].fillPatternImage(konva_pattern_stripes);
                orbitParams.konva_object_icon.getChildren()[1].fillPatternRepeat('repeat');
                orbitParams.konva_object_icon.getChildren()[1].rotation(-45);
            }
        }
    }

    //let background_icon = new Konva.Circle({
    //    preventDefault: false,
    //    radius: icon_r+0,
    //    strokeWidth: 0,
    //    fill: "rgb(20, 20, 220)",
    //    globalCompositeOperation: 'destination-out'
    //});
    
    ////fill
    //if (icon_type==="fill") {
    //    orbitParams.konva_object_icon.fill('rgb(255, 176, 0)');
    //}


    ////stripe
    //if (icon_type==="stripe") {
    //    //console.log("!!!icon_type: ",icon_type);
    //    orbitParams.konva_object_icon.fill(null);
    //    orbitParams.konva_object_icon.fillPatternImage(konva_pattern_stripes);
    //    orbitParams.konva_object_icon.fillPatternRepeat('repeat');
    //    orbitParams.konva_object_icon.rotation(-45);
    //}

    ////group text and background together and return them.
    //let orbitParams.konva_object_icon_group = new Konva.Group({});
    //orbitParams.konva_object_icon_group.add(background_icon);
    //orbitParams.konva_object_icon_group.add(orbitParams.konva_object_icon);

    return orbitParams.konva_object_icon;

}


//chat gpt got this working in one try... 
function getPositionFromOrbit(orbitParams, time) {
    let { period = 1, period_offset = 0, major_axis = 1, minor_axis = 1, focal_axis_offset = 0 } = orbitParams;

    // Calculate the eccentricity of the ellipse
    const eccentricity = Math.sqrt(1 - Math.pow(minor_axis / major_axis, 2));

    //if both axis are 0, return 0.
    if (major_axis===0 & minor_axis===0 ){
    return {
        x: 0,
        y: 0
    };
    };

    //set time to 0 if period is 0, then set period to 360 to prevent div/zero
    if (period===0){
    time=0;
    period=360;
    };

    //scale time to days
    time = time / 864000;

    // Calculate the mean anomaly
    const meanAnomaly = (((-time) + period_offset) / period) * 2 * Math.PI;

    // Using Newton's method to solve Kepler's equation: E - e*sin(E) = M
    let eccentricAnomaly = meanAnomaly;
    for (let i = 0; i < 5; i++) {  // 5 iterations should be sufficient for convergence
    eccentricAnomaly = meanAnomaly + eccentricity * Math.sin(eccentricAnomaly);
    }

    // Calculate the true anomaly from the eccentric anomaly
    const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
    );

    // Calculate the distance from the focus to the point
    const distance = major_axis * (1 - eccentricity * Math.cos(eccentricAnomaly));

    // Calculate the x and y positions in the orbital plane
    const x = distance * Math.cos(trueAnomaly);
    const y = distance * Math.sin(trueAnomaly);

    // Rotate the point around the ellipse's center by the focal axis offset
    const rotatedX = x * Math.cos(focal_axis_offset * Math.PI / 180) - y * Math.sin(focal_axis_offset * Math.PI / 180);
    const rotatedY = x * Math.sin(focal_axis_offset * Math.PI / 180) + y * Math.cos(focal_axis_offset * Math.PI / 180);

    // Return the calculated position
    return {
    x: rotatedX,
    y: rotatedY
    };
}


function getLabelFromOrbit(orbitParams,time){
    let {label, major_axis, minor_axis, focal_axis_offset, icon_r, icon_type } = orbitParams;

    
    if (orbitParams.konva_object_label===undefined){

        // Calculate the distance to the focal point
        const c = Math.sqrt(Math.pow(major_axis, 2) - Math.pow(minor_axis, 2));

        // Create and return the Konva.Ellipse
        let textLabel = new Konva.Text({
            preventDefault: false,
            listening: false,
            perfectDrawEnabled: false,
            x: 0,  
            y: 0,  
            text: label,
            //fontSize: 4,
            fontSize: 4,
            fontFamily: "Noto Sans Mono",
            align: "center",

            strokeWidth: 0,
            fill: "rgb(255, 176, 0)",
            stroke: "rgb(255, 176, 0)",
            shadowColor: "rgb(255, 176, 0)",
            shadowBlur: 0.3,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
        });

        textLabel.x(-textLabel.width()/2);

        let labelBoundingDiameter = Math.sqrt(
            (textLabel.width()*textLabel.width())
            + (textLabel.height()*textLabel.height())); //text box diagonal

        //console.log(label, " needs ", labelBoundingDiameter, ", and has ", icon_r*2);

        if (icon_type ==="v"){
            textLabel.y( (-textLabel.height()) - (icon_r) -0.8 );
            textLabel.strokeWidth();
        }

        //if (icon_r===0) {
        else if (icon_r<=0 || labelBoundingDiameter < (icon_r*2)) {
            icon_r=0;
            textLabel.y( (-textLabel.height()/2) - (icon_r) );
        } 
        
        else {
            textLabel.y( (-textLabel.height()) - (icon_r) - 2 );
        }

        let background = new Konva.Rect({
            preventDefault: false,
            listening: false,
            perfectDrawEnabled: false,
            x: textLabel.x() - 0.5,  // Add some padding
            y: textLabel.y() - 0.5,  // Add some padding
            width: textLabel.width() + 1,  // Add some padding
            height: textLabel.height() + 1,  // Add some padding
            fill: "rgb(20, 20, 20)",
            cornerRadius: 0,  // Optional: rounded corners
            globalCompositeOperation: 'destination-out'
        });

        //group text and background together and return them.
        orbitParams.konva_object_label = new Konva.Group({});
        orbitParams.konva_object_label.add(background);
        orbitParams.konva_object_label.add(textLabel);


    }

    return orbitParams.konva_object_label;
}


//Add time label. 
function adTimeLabel(orbits, time) {


    //create the label when it does not allready exist
    if (orbits.time_label===undefined){

        orbits.time_label = new Konva.Text({
            preventDefault: false,
            listening: false,
            perfectDrawEnabled: false,
            x: 0,  
            y: -100,  
            text: "displayString",
            fontSize: 4,
            fontFamily: "Noto Sans Mono",
            align: "center",
            strokeWidth: 0,
            fill: "rgb(255, 176, 0)",
            stroke: "rgb(255, 176, 0)",
            shadowColor: "rgb(255, 176, 0)",
            shadowBlur: 0.3,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
        });
    
        orbits.layer.add(orbits.time_label);
    }


    //unicode time
    let unicodeTime = Date.now();

    //offset
    let currentTime  = (time*100) + 37868342400*1000; // 1200 year offset

    // Example function to pad single digit numbers with leading zero
    function pad2(number) {
        return (number < 10 ? '0' : '') + number;
    }
    
    // Format date into YYYYMMDD HH:MM:SS
    let date = new Date(currentTime);
    //let formattedDate = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())} ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())}`;
    let formattedDate = `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
    
    // Get day of the week name
    let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let dayOfWeek = daysOfWeek[date.getUTCDay()];

    // Concatenate day of the week to the formatted date
    let displayString = `${formattedDate} ${dayOfWeek}`;
    //let displayString = `${formattedDate}`;

    orbits.time_label.text(displayString);

    //let konva_date_label = new Konva.Text({
    //    preventDefault: false,
    //    listening: false,
    //    perfectDrawEnabled: false,
    //    x: 0,  
    //    y: -100,  
    //    text: displayString,
    //    fontSize: 4,
    //    fontFamily: "Noto Sans Mono",
    //    align: "center",
    //    strokeWidth: 0,
    //    fill: "rgb(255, 176, 0)",
    //    stroke: "rgb(255, 176, 0)",
    //    shadowColor: "rgb(255, 176, 0)",
    //    shadowBlur: 0.3,
    //    shadowOffsetX: 0,
    //    shadowOffsetY: 0,
    //});
//
//
    //layer.add(konva_date_label);
}



console.log('orbitalSystemMap.js done.');