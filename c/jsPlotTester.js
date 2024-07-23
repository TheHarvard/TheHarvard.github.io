
function interpolateTime(currentRealTime, fromRealTime, toRealTime, fromTime, toTime, startSpeed = 1, endSpeed = 1) {
    var deltaTime = toTime-fromTime;

    var deltaRealTime=toRealTime-fromRealTime;
    var positionInAnimation=(currentRealTime-fromRealTime)/deltaRealTime;

    //calculate components
    var component_acceleration = fromTime + startSpeed * (currentRealTime-fromRealTime);
    var component_deceleration = toTime + endSpeed * (currentRealTime-toRealTime);
    var component_linear = fromTime + positionInAnimation * deltaTime;

    if      (positionInAnimation<0){return component_acceleration;}
    if      (positionInAnimation>1){return component_deceleration;}
    return component_linear;

    //set phase width
    var phaseWidth = 0.2;
    //set phase width to always be 2 seconds
    //phaseWidth = deltaTime/20000;
    
    var coefficient_acceleration;
    if      (positionInAnimation<0){coefficient_acceleration = 1;}
    else if (positionInAnimation>phaseWidth){coefficient_acceleration = 0;}
    else    {coefficient_acceleration = (Math.cos((positionInAnimation/(phaseWidth*2))*2*Math.PI)+1)*0.5;}
    //else    {coefficient_acceleration = (1-(positionInAnimation)/phaseWidth)}

    var coefficient_deceleration;
    if      (positionInAnimation<1-phaseWidth){coefficient_deceleration = 0;}
    else if (positionInAnimation>1){coefficient_deceleration = 1;}
    else    {coefficient_deceleration = (Math.cos((positionInAnimation/(phaseWidth*2)-0.5)*2*Math.PI)+1)*0.5;}
    //else    {coefficient_deceleration = (positionInAnimation+phaseWidth-1)*(1/phaseWidth);}

    //normalize
    var coefficient_linear = 1 - (coefficient_acceleration + coefficient_deceleration);
    //var coefficient_linear = 1 ;
    //var coefficient_linear = 0;

    //interpolate and combine the different components
    var currentTime =
          component_acceleration*coefficient_acceleration
        + component_linear*coefficient_linear
        + component_deceleration*coefficient_deceleration;

    return currentTime;
}

function generateTestData(fromRealTime, toRealTime, fromTime, toTime, startSpeed = 1, endSpeed = 1, step = 10) {
    var totalDuration = toRealTime - fromRealTime;
    var extendedStartTime = fromRealTime - totalDuration * 0.2;
    var extendedEndTime = toRealTime + totalDuration * 0.2;

    //run backwards when required
    if (extendedStartTime > extendedEndTime){
        var temp = extendedStartTime;
        extendedStartTime = extendedEndTime;
        extendedEndTime = temp;
    }

    let testData = [];
    let prevTime = interpolateTime(extendedStartTime, fromRealTime, toRealTime, fromTime, toTime, startSpeed, endSpeed);
    for (let currentRealTime = extendedStartTime; currentRealTime <= extendedEndTime; currentRealTime += step) {
        const currentTime = interpolateTime(currentRealTime, fromRealTime, toRealTime, fromTime, toTime, startSpeed, endSpeed);
        const derivative = (currentTime - prevTime) / step;
        testData.push({ currentRealTime, currentTime, derivative });
        prevTime = currentTime;
    }

    return testData;
}

function plotTestData(testData) {
    const timeTrace = {
        x: testData.map(data => data.currentRealTime),
        y: testData.map(data => data.currentTime),
        mode: 'lines',
        name: 'Interpolated Time',
        yaxis: 'y1'
    };

    const derivativeTrace = {
        x: testData.map(data => data.currentRealTime),
        y: testData.map(data => data.derivative),
        mode: 'lines',
        name: 'Rate of Change',
        yaxis: 'y2'
    };

    const layout = {
        title: 'Interpolation Test',
        xaxis: { title: 'Real Time' },
        yaxis: { title: 'Interpolated Time', side: 'left' },
        yaxis2: {
            title: 'Rate of Change',
            overlaying: 'y',
            side: 'right'
        }
    };

    Plotly.newPlot('plot', [timeTrace, derivativeTrace], layout);
}

// Example usage

var rate = 10
//var timeToAnimate = 1000
var fromTime = 100;
var toTime = -100;
//var toTime = fromTime+timeToAnimate;
//var fromRealTime = fromTime/rate;
//var toRealTime = toTime/rate;
var fromRealTime = 0;
var toRealTime = 10;
//const testData = generateTestData(10000, 30000, 1000000, 2000000,0,0,100);
const testData = generateTestData(fromRealTime, toRealTime, fromTime, toTime,5,5,1);
plotTestData(testData);




/*
// Given new linear functions f1(x) = 2x + 1 and f2(x) = -x + 4
const m1 = 2;
const b1 = 1;
const m2 = -1;
const b2 = 2;

// Intersection point
const x_int = (b2 - b1) / (m1 - m2);
const y_int = m1 * x_int + b1;

// Equidistant points from the intersection point
const d = 1;
const x1 = x_int - d;
const x2 = x_int + d;

// Calculate b
const b = Math.log(m1 / -m2) / (x1 - x2);

// Calculate a using x1
const a = m1 / (b * Math.exp(b * x1));

// Calculate c using the intersection with f1(x)
const c = (m1 * x1 + b1) - (a * Math.exp(b * x1));

// Exponential function g(x) = ae^(bx) + c
function g(x) {
    return a * Math.exp(b * x) + c;
}

// Linear functions f1(x) and f2(x)
function f1(x) {
    return m1 * x + b1;
}

function f2(x) {
    return m2 * x + b2;
}

// Example usage to plot using a library like Chart.js or Plotly
console.log(`Exponential function: g(x) = ${a.toFixed(2)}e^(${b.toFixed(2)}x) + ${c.toFixed(2)}`);

console.log(`g(${x1}) = ${g(x1).toFixed(2)}, f1(${x1}) = ${(f1(x1)).toFixed(2)}`);
console.log(`g(${x2}) = ${g(x2).toFixed(2)}, f2(${x2}) = ${(f2(x2)).toFixed(2)}`);

// Plotting the functions using Plotly
const trace1 = {
    x: Array.from({length: 100}, (v, k) => k * 0.1 - 1),
    y: Array.from({length: 100}, (v, k) => g(k * 0.1 - 1)),
    mode: 'lines',
    name: 'g(x)'
};

const trace2 = {
    x: Array.from({length: 100}, (v, k) => k * 0.1 - 1),
    y: Array.from({length: 100}, (v, k) => f1(k * 0.1 - 1)),
    mode: 'lines',
    name: 'f1(x)',
    line: {dash: 'dash'}
};

const trace3 = {
    x: Array.from({length: 100}, (v, k) => k * 0.1 - 1),
    y: Array.from({length: 100}, (v, k) => f2(k * 0.1 - 1)),
    mode: 'lines',
    name: 'f2(x)',
    line: {dash: 'dash'}
};

const layout = {
    title: 'Exponential Function Tangential to Two Linear Functions',
    xaxis: {title: 'x'},
    yaxis: {title: 'y'},
    shapes: [
        {type: 'circle', x0: x1, y0: f1(x1), x1: x1 + 0.1, y1: f1(x1) + 0.1, line: {color: 'black'}},
        {type: 'circle', x0: x2, y0: f2(x2), x1: x2 + 0.1, y1: f2(x2) + 0.1, line: {color: 'black'}}
    ]
};

Plotly.newPlot('plot', [trace1, trace2, trace3], layout);
*/