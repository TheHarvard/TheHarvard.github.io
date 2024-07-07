let stages = [];
let staticOrbits = [];

console.log('orbitalSystemMap.js called...');

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
        
        stages[index].destroyChildren();
        var layer = new Konva.Layer();
        stages[index].add(layer);

        console.log("staticOrbits: ",staticOrbits[index]);
        console.log("stage: ",stages[index]);
        
        renderOrbits(layer,staticOrbits[index]);
        layer.draw();
        element.style.display = ''; //remove style="display:none;"
        
    });


    const animation = new Konva.Animation(function(frame) {
        
        stages.forEach(function (stage, index) {
            //layer.clear();
            //renderOrbits(staticOrbits,frame.time / 1500)
            //layer.draw();
            stage.destroyChildren();
            var layer = new Konva.Layer();
            stage.add(layer);
            renderOrbits(layer,staticOrbits[index],frame.time/70);
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
        startRevealAnimation(stages,50,() => {animation.start();});
    } else {
        //if this is a mid document stop
        //animate the reveal, then restart the typewriter after.
        //startRevealAnimation(stages,50,() => {console.log("animation done");});
        console.log("stages[stages.length-1] : ", stages[stages.length-1])
        startRevealAnimation(stages,50,() => {typeWriter();});
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
        shape.opacity(0);
    });
    stages.forEach(stage => {stage.draw();});

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
    shape.opacity(1); // Snap to visible
    shape.getLayer().batchDraw(); // Redraw the layer to reflect the change

    setTimeout(() => {
        revealElementsRecursive(elements, index + 1, interval, onComplete);
    }, interval);
}


//renders orbits
function renderOrbits(layer,orbits, time = 0, offset = {"x":0,"y":0}){

    //draw each static orbit
    for (let key in orbits) {
    
    //console.log(key, orbits[key]);
    
    //calculate offsets
    let new_offset = getPositionFromOrbit(orbits[key],time);
    total_offset = {"x":0,"y":0};
    total_offset.x = offset.x + new_offset.x;
    total_offset.y = offset.y + new_offset.y;
    //console.log("old offset", offset);
    //console.log("new offset", new_offset);
    //console.log("total offset", total_offset);
    
    //render the orbit
    orbits[key].konva_orbit = getEllipseFromOrbit(orbits[key]);
    //orbits[key].konva_orbit.x((stage.width() / 2)+offset.x);
    //orbits[key].konva_orbit.y((stage.height() / 2)+offset.y);
    orbits[key].konva_orbit.x(115+offset.x);
    orbits[key].konva_orbit.y(0+offset.y);
    layer.add(orbits[key].konva_orbit);
    
    
    //render the icon
    orbits[key].konva_icon = getIconFromOrbit(orbits[key]);
    //orbits[key].konva_icon.x((stage.width() / 2)+total_offset.x);
    //orbits[key].konva_icon.y((stage.height() / 2)+total_offset.y);
    orbits[key].konva_icon.x(115+total_offset.x);
    orbits[key].konva_icon.y(0+total_offset.y);
    layer.add(orbits[key].konva_icon);

    //recursively iterate over satellites
    if (orbits[key].satellites && Object.keys(orbits[key].satellites).length > 0) {
        //console.log("Recursing...");
        renderOrbits(layer,orbits[key].satellites,time,total_offset);
    }

    }

} 







// Function to scale stage based on screen width
function scaleStage() {
    const initialScreenWidth = 240;  // Example: base screen width


    stages.forEach(function (stage, index) {

    //const scale = stage.width() / initialScreenWidth;  // Calculate scale factor based on initial screen width
    const scale = window.innerWidth / initialScreenWidth;  // Calculate scale factor based on initial screen width
    //console.log("stage.width: ", stage.width());
    //console.log("scale: ", scale);
    stage.scaleX(scale);  // Apply scale to X axis
    stage.scaleY(scale);  // Apply scale to Y axis
    stage.width(window.innerWidth);
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
    maxHeight += 10; 
    
    let offset_y = (maxHeight/2);
    
    //console.log("scale", scale, " maxHeight: ",maxHeight, " offset_y: ", offset_y);
    
    // Set the stage height to fit the content
    stage.height(maxHeight*scale);

    // Adjust the position of each layer to center the content vertically
    stage.children.forEach((layer) => {
        layer.y(offset_y);
    });
    

    stage.draw();  // Redraw the stage

    });
}





//creates Konva.Ellipse from orbit data
function getEllipseFromOrbit(orbitParams) {
    const { major_axis, minor_axis, focal_axis_offset } = orbitParams;

    // Calculate the distance to the focal point
    const c = Math.sqrt(Math.pow(major_axis, 2) - Math.pow(minor_axis, 2));

    // Create and return the Konva.Ellipse
    return new Konva.Ellipse({
        x: 0,  // Initial position, can be updated later
        y: 0,  // Initial position, can be updated later
        //x: stage.width() / 2,
        //y: stage.height() / 2,
        radiusX: major_axis,
        radiusY: minor_axis,
        stroke: "rgb(255, 176, 0)",
        shadowColor: "rgb(255, 176, 0)",
        shadowBlur: 1,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        //dashEnabled: true,
        //dash: [10, 10],
        strokeWidth: 0.4,
        rotation: focal_axis_offset,  // Apply the rotation
        offset: {
            x: c,  // Offset to rotate around the right focal point
            y: 0
        }
    });
}

//creates Konva.Ellipse from orbit data
function getIconFromOrbit(orbitParams) {
    const { major_axis, minor_axis, focal_axis_offset, icon_r } = orbitParams;

    // Calculate the distance to the focal point
    const c = Math.sqrt(Math.pow(major_axis, 2) - Math.pow(minor_axis, 2));

    // Create and return the Konva.Ellipse
    return new Konva.Circle({
        //x: 0,  // Initial position, can be updated later
        //y: 0,  // Initial position, can be updated later
        //x: (stage.width() / 2)+major_axis,
        //x: stage.width() / 2,
        //y: stage.height() / 2,
        x: 0,
        y: 0,
        radius: icon_r,
        stroke: "rgb(255, 176, 0)",
        fill: "rgb(255, 176, 0)",
        shadowColor: "rgb(255, 176, 0)",
        shadowBlur: 1,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
    });
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




console.log('orbitalSystemMap.js done.');