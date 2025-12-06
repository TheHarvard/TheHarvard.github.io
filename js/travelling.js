console.log("travelling.js called")

// this file owns anything related to navigation 




// constant acceleration space travel
// these functions are for calculating space trips where we run at a 
// constant acceleration, accelerating for the first part of the trip,
// and then turning around to decelerate for the other half.
// we start and end at rest.
// it assumed newtonian physics and 

const DEFAULT_constantAcceleration = 9.80665; //Standard gravity
const DEFAULT_engineExhaustVelocity = 40000000; //Standard Engine efficiency
const SPEEDOFLIGHT = 299792458; //speed of ligth in m/s
const ASTRONOMICALUNIT = 149598000000; //distance of an astronomical unit in m


// Helper Functions
function _assertPositiveNumber(value, name) {
    if (typeof value !== 'number' || value <= 0) {
        throw new RangeError(`${name} must be a positive number`);
    }
}



// Time Calculations

//Calculate time from distance and acceleration
function thrustGravity_timeFromDistance(
    distance,
    constantAcceleration=DEFAULT_constantAcceleration){

        _assertPositiveNumber(distance,"distance");
        _assertPositiveNumber(constantAcceleration,"constantAcceleration");

        let time  = 2*Math.sqrt(distance/constantAcceleration);
        return time;
}

//Calculate distance from time and acceleration
function thrustGravity_distanceFromTime(
    time,
    constantAcceleration=DEFAULT_constantAcceleration){

        _assertPositiveNumber(time,"time");
        _assertPositiveNumber(constantAcceleration,"constantAcceleration");

        let distance = (constantAcceleration*Math.pow(time,2))/4;
        return distance;
}

//Fuel Mass Fraction calculations

//find distance at given fuel mass fraction
function thrustGravity_distanceFromFuelMassFraction(
    fuelMassFraction,
    constantAcceleration=DEFAULT_constantAcceleration,
    engineExhaustVelocity=DEFAULT_engineExhaustVelocity){

        _assertPositiveNumber(fuelMassFraction,"fuelMassFraction");
        _assertPositiveNumber(constantAcceleration,"constantAcceleration");
        _assertPositiveNumber(engineExhaustVelocity,"engineExhaustVelocity");

        let distance = (Math.pow(engineExhaustVelocity,2)/(4*constantAcceleration)) * Math.pow(Math.log(1/(1-fuelMassFraction)),2);
        return distance;
}

//find required fuel fraction for given distance
function thrustGravity_fuelMassFractionFromDistance(
    distance,
    constantAcceleration=DEFAULT_constantAcceleration,
    engineExhaustVelocity=DEFAULT_engineExhaustVelocity){

        _assertPositiveNumber(distance,"distance");
        _assertPositiveNumber(constantAcceleration,"constantAcceleration");
        _assertPositiveNumber(engineExhaustVelocity,"engineExhaustVelocity");

        let fuelMassFraction = 1-Math.exp(-(2*Math.sqrt(constantAcceleration*distance)/engineExhaustVelocity));
        return fuelMassFraction;
}

// Interpolation

//returns how far along the trip (0-1) the trip has come at trip time
function thrustGravity_interpolateTripDistance(
    time,
    distance,
    constantAcceleration=DEFAULT_constantAcceleration,
    engineExhaustVelocity=DEFAULT_engineExhaustVelocity){

        _assertPositiveNumber(distance,"distance");
        _assertPositiveNumber(constantAcceleration,"constantAcceleration");
        _assertPositiveNumber(engineExhaustVelocity,"engineExhaustVelocity");

        let i = 1; //calculate between 0 and 1 how far along distance trip has come
        return i;
}

//returns the speed at specific trip time
function thrustGravity_interpolateTripSpeed(
    time,
    distance,
    constantAcceleration=DEFAULT_constantAcceleration,
    engineExhaustVelocity=DEFAULT_engineExhaustVelocity){

        _assertPositiveNumber(distance,"distance");
        _assertPositiveNumber(constantAcceleration,"constantAcceleration");
        _assertPositiveNumber(engineExhaustVelocity,"engineExhaustVelocity");

        let speed = 1; //calculate between 0 and 1 how far along distance trip has come
        return speed;
}

//returns the amount of fuel expended at specific trip time
function thrustGravity_interpolateTripFuelFractionConsumed(
    time,
    distance,
    constantAcceleration=DEFAULT_constantAcceleration,
    engineExhaustVelocity=DEFAULT_engineExhaustVelocity){

        _assertPositiveNumber(distance,"distance");
        _assertPositiveNumber(constantAcceleration,"constantAcceleration");
        _assertPositiveNumber(engineExhaustVelocity,"engineExhaustVelocity");

        let fuelMassFraction = thrustGravity_fuelMassFractionFromDistance(
                distance,
                constantAcceleration,
                engineExhaustVelocity) -
            
                thrustGravity_fuelMassFractionFromDistance(
                thrustGravity_interpolateTripDistance(time,distance,constantAcceleration,engineExhaustVelocity),
                constantAcceleration,
                engineExhaustVelocity);
        return fuelMassFraction;
}


//mass calculations

//Calculate max acceleration given
function ship_topAcceleration(
    currentMass,
    nominalMass,
    nominalAcceleration=DEFAULT_constantAcceleration){

        _assertPositiveNumber(currentMass,"currentMass");
        _assertPositiveNumber(nominalMass,"nominalMass");
        _assertPositiveNumber(nominalAcceleration,"nominalAcceleration");

        let topAcceleration = (nominalMass/currentMass)*nominalAcceleration;
        return topAcceleration;
}

//lightspeed conversion

//Calculate distance from time and acceleration
function lightspeed_distanceFromTime(
    time){

        let distance = time*SPEEDOFLIGHT;
        return distance;
}

//Calculate distance from time and acceleration
function lightspeed_timeFromDistance(
    distance){

        let time = distance/SPEEDOFLIGHT;
        return time;
}










//- A - Constant acceleration m/s/s
//- V - Exhaust velocity m/s
//- F - Fuel fraction of total mass %
//- D - Distance m
//- T - Time s
//Calculating distance from fuel fraction:
//D = (V^2/4*A) * ln(1/(1-F))^2
//
//Calculating required fuel fraction for a given distance:
//F = 1-e^ (-(2*sqrt(A*D)/V))
//
//Calculate Time from Distance:
////T = sqrt(2*D/A)
//T = 2*sqrt(D/A)
//
//Calculate Distance from Time:
////D = A*T^2
//D = (A*T^2)/4
//
//
//Benefits of these assumptions and this framework:
//- A given distance always takes the same amount of time, and fuel fraction.
//- Constant acceleration profile is more intuitive that orbital mechanics.
//- Higher acceleration and efficiency feels intuitive as well.
//
//Makes sci-fi space travel aproachable by lay people used to driving
//cars, and not dealing with orbital mechanics.
//
//
//Examples:
//
//- Earth to moon ~0.003AU
//- Mars closest ~ 0.5AU
//- Jupiters orbit R ~ 5AU
//- Saturns orbit R ~ 10AU
//- Uranus orbit R ~ 20AU
//- Neptunes orbit R ~ 30AU
//
//
//
//
//Missing:
//
//Get the proportion of distance travelled at T time:
//D_proportion(T) = 
//
//Get the ship speed at specific time in journey:
//Speed(T) = 
//
//Get the top speed at half the journey:
//Speed_max = 


console.log("travelling.js done")