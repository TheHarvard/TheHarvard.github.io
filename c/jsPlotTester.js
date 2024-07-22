function interpolateTime(currentRealTime, fromRealTime, toRealTime, fromTime, toTime, startSpeed = 1, endSpeed = 1) {
   var sigma=0.0997355701004;
   var sigma_normalizeFactor=4;
   var deltaTime = toTime-fromTime;

   var deltaRealTime=toRealTime-fromRealTime;
   var positionInAnimation=(currentRealTime-fromRealTime)/deltaRealTime;

   //calculate components
   var component_acceleration = fromTime + startSpeed * (currentRealTime-fromRealTime);
   var component_linear = fromTime + positionInAnimation * deltaTime;
   var component_deceleration = toTime + endSpeed * (currentRealTime-toRealTime);

    //calculate coefficients
   function gaussian(x, mu, sigma) {
        const sqrtTwoPi = Math.sqrt(2 * Math.PI);
        const coefficient = 1 / (sigma * sqrtTwoPi);
        const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
        return coefficient * Math.exp(exponent);
    }

    var coefficient_acceleration;
    var coefficient_deceleration;

    if (positionInAnimation<0){
        coefficient_acceleration=sigma_normalizeFactor;
        coefficient_deceleration=0;
    }
    else if (positionInAnimation>1){
        coefficient_acceleration=0;
        coefficient_deceleration=sigma_normalizeFactor;
    }
    else{
    coefficient_acceleration=gaussian(positionInAnimation,0,sigma);
    coefficient_deceleration=gaussian(positionInAnimation,1,sigma);
    }

    //normalize
    coefficient_acceleration=coefficient_acceleration/sigma_normalizeFactor;
    coefficient_deceleration=coefficient_deceleration/sigma_normalizeFactor;
    
    var coefficient_linear = 1 - (coefficient_acceleration + coefficient_deceleration);

    //interpolate and combine the different components
   var currentTime =
          component_acceleration*coefficient_acceleration
        + component_linear*coefficient_linear
        + component_deceleration*coefficient_deceleration;

    return Math.sin((positionInAnimation+0.75)*2*Math.PI);
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
const testData = generateTestData(fromRealTime, toRealTime, fromTime, toTime,1,0,1);
plotTestData(testData);
