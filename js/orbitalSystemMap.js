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
        adTimeLabel(layer,0)
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
            renderOrbits(layer,staticOrbits[index],frame.time*8640);
            adTimeLabel(layer,frame.time*8640)
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
        //startRevealAnimation(stages,60,() => {});
    } else {
        //if this is a mid document stop
        //animate the reveal, then restart the typewriter after.
        //startRevealAnimation(stages,50,() => {console.log("animation done");});
        console.log("stages[stages.length-1] : ", stages[stages.length-1])
        startRevealAnimation(stages,60,() => {typeWriter();});
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

        //calculate offsets
        let new_offset = getPositionFromOrbit(orbits[key],time);
        total_offset = {"x":0,"y":0};
        total_offset.x = offset.x + new_offset.x;
        total_offset.y = offset.y + new_offset.y;
        //console.log("old offset", offset);
        //console.log("new offset", new_offset);
        //console.log("total offset", total_offset);

        if (typeof orbits[key].orbit_w === 'number' && orbits[key].orbit_w > 0) {
            //render the orbit
            orbits[key].konva_orbit = getEllipseFromOrbit(orbits[key]);
            orbits[key].konva_orbit.x(115+offset.x);
            orbits[key].konva_orbit.y(0+offset.y);
            layer.add(orbits[key].konva_orbit);
    }


        if (typeof orbits[key].icon_r === 'number' && orbits[key].icon_r > 0) {
            //render the icon
            orbits[key].konva_icon = getIconFromOrbit(orbits[key]);
            orbits[key].konva_icon.x(115+total_offset.x);
            orbits[key].konva_icon.y(0+total_offset.y);
            layer.add(orbits[key].konva_icon);
        }

        if (typeof orbits[key].label === 'string' && orbits[key].label.trim() !== '') {
            //render label (is present)
            orbits[key].konva_label = getLabelFromOrbit(orbits[key]);
            orbits[key].konva_label.x(115+total_offset.x+orbits[key].konva_label.x());
            orbits[key].konva_label.y(0+total_offset.y+orbits[key].konva_label.y());
            layer.add(orbits[key].konva_label);
        }

        //recursively iterate over satellites
        if (orbits[key].satellites && Object.keys(orbits[key].satellites).length > 0) {
            //console.log("Recursing...");
            renderOrbits(layer,orbits[key].satellites,time,total_offset);
        }
    }


    ////reorder all elements in layer so text boxes are on top.
    //layer.getChildren().forEach((shape) => {
    //    if (shape instanceof Konva.Text) {
    //      shape.moveToTop();
    //    }
    //  });

    //cache and apply blur on entire layer
    //layer.cache();
    // Apply the blur filter to the layer
    //layer.filters([Konva.Filters.Blur]);
    //layer.blurRadius(0.001); // Set the blur radius

} 







// Function to scale stage based on screen width
function scaleStage() {
    const initialScreenWidth = 240;  // Example: base screen width


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
    let { orbit_w, orbit_type, major_axis, minor_axis, focal_axis_offset } = orbitParams;

    // Calculate the distance to the focal point
    const c = Math.sqrt(Math.pow(major_axis, 2) - Math.pow(minor_axis, 2));

    // Create and return the Konva.Ellipse
    let ellipse = new Konva.Ellipse({
        preventDefault: false,
        x: 0,  // Initial position, can be updated later
        y: 0,  // Initial position, can be updated later
        //x: stage.width() / 2,
        //y: stage.height() / 2,
        radiusX: major_axis,
        radiusY: minor_axis,
        stroke: "rgb(255, 176, 0)",
        shadowColor: "rgb(255, 176, 0)",
        shadowBlur: 0,
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


    if (orbit_type==="dash") {
        ellipse.dashEnabled(true);
        ellipse.dash([5, 20]);
    }

    return ellipse;
}

//creates Konva.Ellipse from orbit data
function getIconFromOrbit(orbitParams) {
    let { major_axis, minor_axis, focal_axis_offset, icon_r } = orbitParams;

    // Calculate the distance to the focal point
    //const c = Math.sqrt(Math.pow(major_axis, 2) - Math.pow(minor_axis, 2));


    // Create and return the Konva.Ellipse
    return new Konva.Circle({
        //x: 0,  // Initial position, can be updated later
        //y: 0,  // Initial position, can be updated later
        //x: (stage.width() / 2)+major_axis,
        //x: stage.width() / 2,
        //y: stage.height() / 2,
        preventDefault: false,
        x: 0,
        y: 0,
        radius: icon_r,
        stroke: "rgb(255, 176, 0)",
        fill: "rgb(255, 176, 0)",
        shadowColor: "rgb(255, 176, 0)",
        shadowBlur: 0,
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


function getLabelFromOrbit(orbitParams){
    const {label, major_axis, minor_axis, focal_axis_offset, icon_r } = orbitParams;

    // Calculate the distance to the focal point
    const c = Math.sqrt(Math.pow(major_axis, 2) - Math.pow(minor_axis, 2));

    // Create and return the Konva.Ellipse
    let textLabel = new Konva.Text({
        preventDefault: false,
        x: 0,  
        y: 0,  
        text: label,
        fontSize: 5,
        fontFamily: "Noto Sans Mono",
        align: "center",

        strokeWidth: 0,
        fill: "rgb(255, 176, 0)",
        stroke: "rgb(255, 176, 0)",
        shadowColor: "rgb(255, 176, 0)",
        shadowBlur: 1,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
    });

    textLabel.x(-textLabel.width()/2);

    if (icon_r===0) {
        textLabel.y( (-textLabel.height()/2) - (icon_r) );
    } else {
        textLabel.y( (-textLabel.height()) - (icon_r) - 2 );
    }

    return textLabel;
}


//Add time label. 
function adTimeLabel(layer, time) {
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
    //let displayString = `${formattedDate} ${dayOfWeek}`;
    let displayString = `${formattedDate}`;

    let konva_date_label = new Konva.Text({
        preventDefault: false,
        x: 0,  
        y: -100,  
        text: displayString,
        fontSize: 5,
        fontFamily: "Noto Sans Mono",
        align: "center",
        strokeWidth: 0,
        fill: "rgb(255, 176, 0)",
        stroke: "rgb(255, 176, 0)",
        shadowColor: "rgb(255, 176, 0)",
        shadowBlur: 1,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
    });

    layer.add(konva_date_label);
}



console.log('orbitalSystemMap.js done.');