let stages = [];
let staticOrbits = [];
let focusableShapes = [];

console.log('orbitalSystemMap.js called...');


// Create hidden focus elements
//var focusContainer = document.getElementById('focus-elements');
var focusContainer = document.getElementById('display');

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
        startRevealAnimation(stages,75,() => {animation.start();});
        //startRevealAnimation(stages,60,() => {});
    } else {
        //if this is a mid document stop
        //animate the reveal, then restart the typewriter after.
        //startRevealAnimation(stages,50,() => {console.log("animation done");});
        //console.log("stages[stages.length-1] : ", stages[stages.length-1])
        startRevealAnimation(stages,75,() => {typeWriter();});
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
function renderOrbits(orbits, time = 0, offset = {"x":0,"y":0},layer,labelsToBePutOnTop_override,){

    var addToLayer = false;
    var labelsToBePutOnTop = [];

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
        if (orbits[key].link===null || orbits[key].link === undefined) { orbits[key].link = ""; }

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
            //if (orbits[key].link==="") {
                orbits.layer.add(konva_label);
                labelsToBePutOnTop.push(konva_label)
            //}
        }
        
        //recursively iterate over satellites
        if (orbits[key].satellites && Object.keys(orbits[key].satellites).length > 0) {
            //console.log("Recursing...");
            renderOrbits(orbits[key].satellites,time,total_offset,orbits.layer,labelsToBePutOnTop);
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
                //if (!orbits[key].link==="") {
                //  orbits.layer.add(konva_label);
                //  labelsToBePutOnTop.push(konva_label)
                //}
            }
        }

    }

    if (labelsToBePutOnTop_override===null || labelsToBePutOnTop_override === undefined)  {
    
        //reorder the labels to be on top.
        if (addToLayer) {
            labelsToBePutOnTop.forEach((shape) => {
                if (shape instanceof Konva.Group) {
                shape.moveToTop();
                }
            });
        }

    }
    else {

        //return the labels to be put on top to the higher recursion 
        labelsToBePutOnTop.forEach((shape) => {
            labelsToBePutOnTop_override.push(shape)
        })
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
    let maxHeight = 180;
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
            
            //use kepler's third law to create new periods from the new radius
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

    // special case for black holes, and other animated icons.
    
    if (icon_type==="blackhole"){

        var firstRender = false;

        var noisePattern = {};
        //orbital period
        var orbit_radius = 1; //reference radius
        var orbit_period = 500000; //orbital period at orbit_radius
        var accretionRing_w = 1.0;
        var accretionRing_amount = Math.round((icon_r*0.5)/accretionRing_w);
        var patriclesPerRing = 250/accretionRing_amount;

        // of first render
        if (orbitParams.konva_object_icon===undefined){
            orbitParams.animatedShapes = {};
            orbitParams.animatedShapes.accretionDisk_lowerMirror = [];
            orbitParams.animatedShapes.accretionDisk = [];
            orbitParams.animatedShapes.accretionDisk_upperMirror = [];
            for (let i = 0; i < accretionRing_amount; i++) {
                orbitParams.animatedShapes.accretionDisk_lowerMirror[i] = [];
                orbitParams.animatedShapes.accretionDisk[i] = [];
                orbitParams.animatedShapes.accretionDisk_upperMirror[i] = [];
            }
            orbitParams.konva_object_icon = new Konva.Group({});
            firstRender = true;
        }


        if (firstRender){
            //create noise pattern for the accretion disk
            orbitParams.noisePattern = {}
            orbitParams.noisePattern.strokeWidth = [];
            orbitParams.noisePattern.orbitalPeriod = [];
            orbitParams.noisePattern.particleOffsets = [];
            for (let i = 0; i < accretionRing_amount; i++) {
                orbitParams.noisePattern.strokeWidth.push((Math.random()-0.5)*0.2);
                //noisePattern.strokeWidth.push((Math.random()-0.5)*0.3);

                //calculate orbital periods
                orbitParams.noisePattern.orbitalPeriod.push(orbit_period * Math.pow((0.5*icon_r+i*accretionRing_w) / orbit_radius, 3 / 2));
                //noisePattern.orbitalPeriod.push(800000*i);
                
                //generate particles for each orbit
                orbitParams.noisePattern.particleOffsets[i] = [];
                for (let j = 0; j < patriclesPerRing; j++) {
                    orbitParams.noisePattern.particleOffsets[i].push((Math.random()));
                }
            }

        //noisePattern.strokeWidth[0] = 0;
        //noisePattern.strokeWidth[1] = 0.15;
        //noisePattern.strokeWidth[1] = 0.1;
        //noisePattern.strokeWidth[accretionRing_amount-1] = -0.05;
        //noisePattern.strokeWidth[accretionRing_amount] = -0.1;

        }

        noisePattern = orbitParams.noisePattern;

        //particles
        
        
        for (let i = 0; i < accretionRing_amount; i++) {
            // Lower Accretion disk mirror

            //interpolate over the range
            var radius =  
          (  (i/accretionRing_amount)) * ((icon_r*0.5*0.75)+(icon_r*0.5*0.75)*(i/accretionRing_amount))  //outermost ring
        + (1-(i/accretionRing_amount)) * ((icon_r*0.5*1.00)+(icon_r*0.5*1.00)*(i/accretionRing_amount)); //innermost ring

            if (firstRender) {
                orbitParams.konva_object_icon.add(
                    new Konva.Arc({

                        preventDefault: false,
                        listening: false,
                        perfectDrawEnabled: false,
                        outerRadius: radius+0.0 - noisePattern.strokeWidth[i]*0.5,
                        innerRadius: radius+0.4 + noisePattern.strokeWidth[i]*0.5,
                        //innerRadius: (icon_r*0.5),
                        x: 0,
                        y: (i/accretionRing_amount)*icon_r*((1-0.75)*0.5),
                        angle: 200,
                        rotation: -10,
                        //stroke: "rgb(255, 176, 0)",
                        fill: "rgb(255, 176, 0)",
                        shadowColor: "rgb(255, 176, 0)",
                        //strokeWidth: 0.4 + noisePattern.strokeWidth[i],
                        shadowBlur: 0.3,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                        //linecap: "round",
                        //globalCompositeOperation: 'destination-out'
                        
                    })
                );
            }


            //generate particles at radius+0.2
            //orbitParams.animatedShapes.accretionDisk_lowerMirror = [];
            //console.log("HELLO? ", time);
            populateBHOrbitals(
                firstRender,
                icon_r,
                noisePattern,
                orbitParams,
                i,
                orbitParams.animatedShapes.accretionDisk_lowerMirror[i],
                time,
                radius+0.2,
                radius+0.2,
                0,
                (i/accretionRing_amount)*icon_r*((1-0.75)*0.5),
                //0.475, outermost orbit
                //0.025
                //0.420, innermost orbit
                //0.081
                0.420*(1-(i/accretionRing_amount))+0.475*((i/accretionRing_amount)), 
                0.081*(1-(i/accretionRing_amount))+0.025*((i/accretionRing_amount)),
                false,
            )
            
        }


        //single lower line
        if (firstRender) {
            orbitParams.konva_object_icon.add(
                new Konva.Arc({

                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    outerRadius: icon_r*0.35+0.0,
                    innerRadius: icon_r*0.35+0.4,
                    x: 0,
                    y: 0,
                    angle: 200,
                    rotation: -10,
                    //stroke: "rgb(255, 176, 0)",
                    fill: "rgb(255, 176, 0)",
                    shadowColor: "rgb(255, 176, 0)",
                    strokeWidth: 0.4,
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    //linecap: "round",
                    //globalCompositeOperation: 'destination-out'
                    
                })
            );
        }

        
        // Lower Accretion disk occluder (acretion disk)
        if (firstRender) {
            orbitParams.konva_object_icon.add(
                new Konva.Ellipse({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    radiusX: (icon_r+icon_r*1.5)+0.8,
                    radiusY: (icon_r*0.05+icon_r*0.195)+0.8,
                    fill: "rgb(255, 176, 0)",
                    //stroke: "rgb(255, 176, 0)",
                    //shadowColor: "rgb(255, 176, 0)",
                    strokeWidth: 0.1,
                    //shadowBlur: 0.3,
                    //shadowOffsetX: 0,
                    //shadowOffsetY: 0,
                    globalCompositeOperation: 'destination-out'
                })
            );
            }



        //accretion disc on edge from camera
       for (let i = 0; i < accretionRing_amount; i++) {

        //break;

        //adjust spacing to line up with upper accretion disk
        //var j = i-((1-(i/accretionRing_amount))*0.8);
        var i_adjusted = Math.pow(i/accretionRing_amount,1.375);

            if (firstRender) {
                orbitParams.konva_object_icon.add(
                    new Konva.Ellipse({
                        preventDefault: false,
                        listening: false,
                        perfectDrawEnabled: false,
                        //radiusX: icon_r*0.5+(i/accretionRing_amount)*icon_r*2.0,
                        //radiusY: icon_r*0.05+(i/accretionRing_amount)*icon_r*0.195,
                        radiusX: icon_r*0.5+i_adjusted*icon_r*2.0,
                        radiusY: icon_r*0.05+i_adjusted*icon_r*0.195,
                        //fill: "rgb(255, 176, 0)",
                        stroke: "rgb(255, 176, 0)",
                        shadowColor: "rgb(255, 176, 0)",
                        strokeWidth: 0.4 + noisePattern.strokeWidth[i],
                        shadowBlur: 0.3,
                        shadowOffsetX: 0,
                        shadowOffsetY: 0,
                    })
                );
            }

            //console.log("noisePattern.particleOffsets: ",noisePattern.particleOffsets.length, noisePattern.particleOffsets )
            
            populateBHOrbitals(
                firstRender,
                icon_r,
                noisePattern,
                orbitParams,
                i,
                orbitParams.animatedShapes.accretionDisk[i],
                time,
                icon_r*0.5+i_adjusted*icon_r*2.0,
                icon_r*0.05+i_adjusted*icon_r*0.195,
                0,
                0,
                0,
                0,
                true,
            )
                
                

    }

        

        
        //occlude back of accretion disc (behind event horizon) 
        if (firstRender) {
            orbitParams.konva_object_icon.add(
                new Konva.Arc({
            
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    innerRadius: 0,
                    outerRadius: icon_r*0.5,
                    angle: 180,
                    rotation: 180,
                    //stroke: "rgb(255, 176, 0)",
                    fill: "rgb(255, 176, 0)",
                    //shadowColor: "rgb(255, 176, 0)",
                    strokeWidth: 0.4,
                    //shadowBlur: 0.3,
                    //shadowOffsetX: 0,
                    //shadowOffsetY: 0,
                    globalCompositeOperation: 'destination-out'
                    
                })
            );
        }

    
        //occlude additional parts of the accretion disk to make illusion of seamlesness - trapezoid
        
        let topWidth = icon_r*4.1;
        let bottomWidth = icon_r;
        let height = icon_r*0.5;
        let centerX = 0;
        let centerY = -height*0.5;
        
        // Calculate the points of the trapezoid
        let points = [
            centerX - bottomWidth / 2, centerY + height / 2, // Bottom-left point
            centerX + bottomWidth / 2, centerY + height / 2, // Bottom-right point
            centerX + topWidth / 2, centerY - height / 2, // Top-right point
            centerX - topWidth / 2, centerY - height / 2  // Top-left point
        ];

        // Create the trapezoid using Konva.Line
        if (firstRender) {
            orbitParams.konva_object_icon.add(
                new Konva.Line({
                    points: points,
                    closed: true,
            
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    //stroke: "rgb(255, 176, 0)",
                    fill: "rgb(255, 176, 222)",
                    //shadowColor: "rgb(255, 176, 0)",
                    strokeWidth: 0.4,
                    //shadowBlur: 0.3,
                    //shadowOffsetX: 0,
                    //shadowOffsetY: 0,
                    globalCompositeOperation: 'destination-out'
                })
            );
        }



        for (let i = 0; i < accretionRing_amount; i++) {
            // upper Accretion disk mirror
            
            //interpolate over the range
            var radius =  
         (  (i/accretionRing_amount)) * ((icon_r*0.5*1.25)+(icon_r*0.5*1.25)*(i/accretionRing_amount))  //outermost ring
       + (1-(i/accretionRing_amount)) * ((icon_r*0.5*1.00)+(icon_r*0.5*1.00)*(i/accretionRing_amount)); //innermost ring

       var angleOffset = ((i/accretionRing_amount)*42) 
       + (Math.sin((i/accretionRing_amount)*Math.PI)*10);


        if (firstRender) {
            orbitParams.konva_object_icon.add(
                new Konva.Arc({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    //outerRadius: (icon_r*0.5*1.00)+(icon_r*0.5*1.00)*(i/accretionRing_amount)+0.0,
                    //innerRadius: (icon_r*0.5*1.00)+(icon_r*0.5*1.00)*(i/accretionRing_amount)+0.4,
                    outerRadius: radius+0.0 - noisePattern.strokeWidth[i]*0.5,
                    innerRadius: radius+0.4 + noisePattern.strokeWidth[i]*0.5,
                    //innerRadius: (icon_r*0.5),
                    x: 0,
                    //y: -(i/accretionRing_amount)*icon_r*((1-1.25)*0.5),
                    y: -(i/accretionRing_amount)*icon_r*((1-1.25)),
                    angle: 180-angleOffset,
                    rotation: 180+angleOffset*0.5,
                    //stroke: "rgb(255, 176, 0)",
                    fill: "rgb(255, 176, 0)",
                    shadowColor: "rgb(255, 176, 0)",
                    //strokeWidth: 0.4 + noisePattern.strokeWidth[i],
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    //globalCompositeOperation: 'destination-out'
                    
                })
            );
        }

            //generate particles at radius+0.2
            //orbitParams.animatedShapes.accretionDisk_upperMirror = [];

            var interpolate = (i/accretionRing_amount)+Math.sin(i/accretionRing_amount*Math.PI)*0.25;
            var interpolate_inverse = 1-interpolate;
            
            populateBHOrbitals(
                firstRender,
                icon_r,
                noisePattern,
                orbitParams,
                i,
                orbitParams.animatedShapes.accretionDisk_upperMirror[i],
                time,
                radius+0.2,
                radius+0.2,
                0,
                -(i/accretionRing_amount)*icon_r*((1-1.25)),
                //1, //innermost
                //0.5, 
                //0.941, //outermost
                //0.560, 
                //1.000*(1-(i/accretionRing_amount))+0.941*((i/accretionRing_amount)), 
                //0.500*(1-(i/accretionRing_amount))+0.560*((i/accretionRing_amount)),
                1.000*interpolate_inverse+0.941*interpolate, 
                0.500*interpolate_inverse+0.560*interpolate,
                true,
            )
            

        }

        //single upper ring
        
        if (firstRender) {
            orbitParams.konva_object_icon.add(
                new Konva.Arc({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    //outerRadius: (icon_r*0.5*1.00)+(icon_r*0.5*1.00)*(i/accretionRing_amount)+0.0,
                    //innerRadius: (icon_r*0.5*1.00)+(icon_r*0.5*1.00)*(i/accretionRing_amount)+0.4,
                    outerRadius: icon_r*0.35+0.0,
                    innerRadius: icon_r*0.35+0.4,
                    //innerRadius: (icon_r*0.5),
                    x: 0,
                    //y: -(i/accretionRing_amount)*icon_r*((1-1.25)*0.5),
                    y: 0,
                    angle: 180,
                    rotation: 180,
                    //stroke: "rgb(255, 176, 0)",
                    fill: "rgb(255, 176, 0)",
                    shadowColor: "rgb(255, 176, 0)",
                    strokeWidth: 0.4,
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    //globalCompositeOperation: 'destination-out'
                    
                })
            )
        }

        //rotate 15 degrees for that artistic look
        orbitParams.konva_object_icon.rotation(-15);

    }

    // normal case for non-animated icons
    else if (orbitParams.konva_object_icon===undefined){

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

        //Spike jump hexagons 
        else if (icon_type==="spikejump1"||icon_type==="spikejump2"
               ||icon_type==="spikejump3"||icon_type==="spikejump4"
               ||icon_type==="spikejump5"||icon_type==="spikejump6") {

               let text = "1";
        
               if (icon_type==="spikejump1"){text="1"}
               if (icon_type==="spikejump2"){text="2"}
               if (icon_type==="spikejump3"){text="3"}
               if (icon_type==="spikejump4"){text="4"}
               if (icon_type==="spikejump5"){text="5"}
               if (icon_type==="spikejump6"){text="6"}

               
            // add background
            orbitParams.konva_object_icon.add(
                new Konva.RegularPolygon({
                    preventDefault: false,
                    listening: false,
                    perfectDrawEnabled: false,
                    lineJoin: "miter",
                    
                    radius: icon_r+1,
                    sides: 6,

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
                    strokeWidth: 0.4,
                    shadowBlur: 0.3,
                    shadowOffsetX: 0,
                    shadowOffsetY: 0,
                    lineJoin: "miter",
                    
                    radius: icon_r,
                    sides: 6,
                })
            );

            // add label
            var numLabel = new Konva.Text({
                preventDefault: false,
                listening: false,
                perfectDrawEnabled: false,
                x: 0,  
                y: 0,  
                text: text,
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
            })

            numLabel.x(-numLabel.width()/2);
            numLabel.y(-numLabel.height()/2);

            orbitParams.konva_object_icon.add(numLabel);

        }
        
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
        

    //return the icon
    return orbitParams.konva_object_icon;

}


function projectPointOnEllipticalOrbit(angleOnCircle, majorRadiusEllipse, minorRadiusEllipse) {
    // Calculate coordinates on the circle
    let xCircle = majorRadiusEllipse * Math.cos(angleOnCircle);
    let yCircle = majorRadiusEllipse * Math.sin(angleOnCircle);

    // Project onto the ellipse
    let xEllipse = xCircle;
    let yEllipse = minorRadiusEllipse * Math.sin(angleOnCircle);

    return { x: xEllipse, y: yEllipse };
}


function populateBHOrbitals(
    firstRender,
    icon_r,
    noisePattern,
    orbitParams,
    i,
    shapeArray,
    time,
    ellipsis_x,
    ellipsis_y,
    offset_x=0,
    offset_y=0,
    muting_low=0,
    muting_high=0,
    reverse=false,
    ) {

    var numberOfParticles = noisePattern.particleOffsets[i].length;
    for (let j = 0; j < numberOfParticles; j++) {
        //generate particles at radius+0.2
        //orbitParams.animatedShapes.accretionDisk = [];
        if (firstRender) {

            //orbitParams.animatedShapes.accretionDisk[i][j] = new Konva.Circle({
                shapeArray[j] = new Konva.Circle({
                preventDefault: false,
                listening: false,
                perfectDrawEnabled: false,
                radius: 0.3,
                fill: "rgb(255, 176, 0)",
                shadowColor: "rgb(255, 176, 0)",
                //shadowBlur: 0.3,
                shadowBlur: 0.6,
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                x:icon_r*2,
                y:icon_r*2
            });

            //orbitParams.konva_object_icon.add(orbitParams.animatedShapes.accretionDisk[i][j]);
            orbitParams.konva_object_icon.add(shapeArray[j]);
        }
        //var particleShape = orbitParams.animatedShapes.accretionDisk[i][j];
        var particleShape = shapeArray[j];

        //noisePattern.orbitalPeriod[i] = 5000000;

        var orbitalPeriod = noisePattern.orbitalPeriod[i];
        //var offset = (time%orbitalPeriod)/orbitalPeriod;

        //var particleOffset = (j/numberOfParticles*orbitalPeriod)
        var particleOffset = noisePattern.particleOffsets[i][j]*orbitalPeriod;
        var totalOffset = ((((time%orbitalPeriod)+particleOffset)/orbitalPeriod)%1); // where in orbit 0-1

        if (reverse) {totalOffset = 1-totalOffset}

        //console.log("totalOffset: ", totalOffset);

        // check for muting
        var mute=false;
        if (muting_high>muting_low){
            if (totalOffset<muting_high && totalOffset>muting_low) {mute=true;}
        }
        else if (muting_low>muting_high){
            mute=true;
            if (totalOffset<muting_low && totalOffset>muting_high) {mute=false;}
        }
        if (mute) {particleShape.visible(false)}
        else {particleShape.visible(true)}

        var offset = projectPointOnEllipticalOrbit(
            //(((-time%orbitalPeriod)+particleOffset)/orbitalPeriod)*2*Math.PI,
            totalOffset*2*Math.PI,
            //icon_r*0.5+i_adjusted*icon_r*2.0,
            //icon_r*0.05+i_adjusted*icon_r*0.195
            ellipsis_x,
            ellipsis_y
        );
        //console.log("offset: ", offset)

        particleShape.x(offset.x+offset_x);
        particleShape.y(offset.y+offset_y);
        //particleShape.x((icon_r*2)+offset.x);
        //particleShape.y((icon_r*2)+offset.y);
    }
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
    let {label, major_axis, minor_axis, focal_axis_offset, icon_r, icon_type, link } = orbitParams;

    
    if (orbitParams.konva_object_label===undefined){

        // Calculate the distance to the focal point
        const c = Math.sqrt(Math.pow(major_axis, 2) - Math.pow(minor_axis, 2));

        // Create  Konva.Text
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

        if (icon_r===0) {
        //else if (icon_r<=0 || labelBoundingDiameter < (icon_r*2)) {
            icon_r=0;
            textLabel.y( (-textLabel.height()/2) - (icon_r) );
        } 
        
        else {
            textLabel.y( (-textLabel.height()) - (icon_r) - 1.75 );
        }

        let background = new Konva.Rect({
            preventDefault: false,
            listening: false,
            perfectDrawEnabled: false,
            x: textLabel.x() - 0.5,  // Add some padding
            y: textLabel.y() - 0.5,  // Add some padding
            width: textLabel.width() + 1,  // Add some padding
            height: textLabel.height() + 1,  // Add some padding
            fill: "rgb(255, 176, 0)",
            //stroke: "rgb(255, 176, 0)",
            shadowColor: "rgb(255, 176, 0)",
            shadowBlur: 0,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            cornerRadius: 0,  // Optional: rounded corners
            globalCompositeOperation: 'destination-out'
        });

        //group text and background together and return them.
        orbitParams.konva_object_label = new Konva.Group({});
        orbitParams.konva_object_label.add(background);
        orbitParams.konva_object_label.add(textLabel);

        //add link behavior if link is set
        if (link!==null && link !== undefined && link !== "") { 

            //console.log("added event listeners to ", orbitParams.konva_object_label)

            textLabel.listening(true);
            orbitParams.konva_object_label.listening(true);

            //textLabel.tabindex(0);
            //orbitParams.konva_object_label.tabindex(0);

            textLabel.textDecoration("underline");

            //add click event behavior
            orbitParams.konva_object_label.on('click', function(evt) {
                //Left click
                if (evt.evt.button === 0) {
                window.location.href = link; // Navigates current tab
                }
                //middle click
                if (evt.evt.button === 1) {
                window.open(link, '_blank'); // Opens in new tab
                }
            });

            //... and for touch
            //orbitParams.konva_object_label.on('touchstart', function(evt) {
            //    window.location.href = link; // Navigates current tab
            //});

            //add hover event behavior
            orbitParams.konva_object_label.on('mouseover', function() {
                textLabel.globalCompositeOperation("destination-out");
                background.globalCompositeOperation(null);
                background.shadowBlur(0.3);
                stages.forEach(stage => {stage.batchDraw();});
            });

            orbitParams.konva_object_label.on('mouseout', function() {
                textLabel.globalCompositeOperation(null);
                background.globalCompositeOperation("destination-out");
                background.shadowBlur(0);
                stages.forEach(stage => {stage.batchDraw();});
            });

            //orbitParams.konva_object_label.on('focus', function() {
            //    textLabel.globalCompositeOperation("destination-out");
            //    background.globalCompositeOperation(null);
            //    background.shadowBlur(0.3);
            //    stages.forEach(stage => {stage.batchDraw();})
            //});
//
            //orbitParams.konva_object_label.on('blur', function() {
            //    textLabel.globalCompositeOperation(null);
            //    background.globalCompositeOperation("destination-out");
            //    background.shadowBlur(0);
            //    stages.forEach(stage => {stage.batchDraw();})
            //;});

            

            //add to the focusable shapes list, get its index
            var index = focusableShapes.push(orbitParams.konva_object_label)-1;

            // Create corresponding hidden focus element
            var focusElement = document.createElement('div');
            focusElement.setAttribute('tabindex', '0');
            focusElement.setAttribute('id', 'focus-' + index);
            focusElement.style.position = 'absolute';
            focusContainer.appendChild(focusElement);

            console.log("adding focus element index: ",index);

            // Sync focus and blur events with Konva shape
            focusElement.addEventListener('focus', function() {
                textLabel.globalCompositeOperation("destination-out");
                background.globalCompositeOperation(null);
                background.shadowBlur(0.3);
                stages.forEach(stage => {stage.batchDraw();})
                //scroll to me
                var stage = orbitParams.konva_object_label.getStage();
                var htmlElement = stage.container();
                htmlElement.scrollIntoView();

            });

            focusElement.addEventListener('blur', function() {
                textLabel.globalCompositeOperation(null);
                background.globalCompositeOperation("destination-out");
                background.shadowBlur(0);
                stages.forEach(stage => {stage.batchDraw();})
            });

            // Handle Enter key to open the URL
            focusElement.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    window.location.href = link; // Navigates current tab
                }
            });

        }

    }

    return orbitParams.konva_object_label;
}

// Add keyboard listener for tab navigation on the container
//document.addEventListener('keydown', handleTabNavigation);

//// Function to handle tab navigation
//function handleTabNavigation(e) {
//
//    
//    
//    //var shapes = layer.children;
//    var shapes = focusableShapes;
//    var currentFocus = document.activeElement;
//    var currentIndex = -1;
//    
//    
//    // Find the index of the currently focused element
//    if (currentFocus && currentFocus.id && currentFocus.id.startsWith('focus-')) {
//        currentIndex = parseInt(currentFocus.id.split('-')[1]);
//    }
//    
//    console.log("handleTabNavigation() called, Current index: ",currentIndex);
//    console.log("currentFocus: ", currentFocus);
//
//    return;
//
//    if (e.key === 'Tab') {
//        var nextIndex;
//
//        if (e.shiftKey) {
//            // Shift + Tab for previous
//            nextIndex = currentIndex > 0 ? currentIndex - 1 : shapes.length - 1;
//        } else {
//            // Tab for next
//            nextIndex = currentIndex < shapes.length - 1 ? currentIndex + 1 : 0;
//        }
//
//        if (nextIndex >= 0 && nextIndex < shapes.length) {
//            document.getElementById('focus-' + nextIndex).focus();
//            e.preventDefault();
//        }
//    }
//}



//Add time label. 
function adTimeLabel(orbits, time) {


    //create the label when it does not already exist
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