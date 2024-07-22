function interpolateTime(currentRealTime, fromRealTime, toRealTime, fromTime, toTime, startSpeed = 1, endSpeed = 1) {
    var deltaTime = toTime-fromTime;

    var deltaRealTime=toRealTime-fromRealTime;
    var positionInAnimation=(currentRealTime-fromRealTime)/deltaRealTime;

    //calculate components
    var component_acceleration = fromTime + startSpeed * (currentRealTime-fromRealTime);
    var component_linear = fromTime + positionInAnimation * deltaTime;
    var component_deceleration = toTime + endSpeed * (currentRealTime-toRealTime);

    //set phase width
    var phaseWidth = 0.2;
    //set phase width to always be 2 seconds
    phaseWidth = deltaTime/20000;

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
    //var coefficient_linear = 0;

    //interpolate and combine the different components
    var currentTime =
          component_acceleration*coefficient_acceleration
        + component_linear*coefficient_linear
        + component_deceleration*coefficient_deceleration;

    return currentTime;
}

function generateTestData(fromRealTime, toRealTime, fromTime, toTime, startSpeed = 1, endSpeed = 1, step = 10) {
    const totalDuration = toRealTime - fromRealTime;
    const extendedStartTime = fromRealTime - totalDuration * 0.2;
    const extendedEndTime = toRealTime + totalDuration * 0.2;

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
var timeToAnimate = 1000
var fromTime = 0;
var toTime = fromTime+timeToAnimate;
var fromRealTime = fromTime/rate;
var toRealTime = toTime/rate;
//const testData = generateTestData(10000, 30000, 1000000, 2000000,0,0,100);
const testData = generateTestData(fromRealTime, toRealTime, fromTime, toTime,0,2,1);
plotTestData(testData);
