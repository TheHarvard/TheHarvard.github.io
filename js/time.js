// local storage section - these values are also stored in local storage.
// ============================================================================

//real time reported from browser
var realTime = 0; 

//in universe time
var time = 0; 

//offset from real time to reach time
var mainTimeOffset = 0; 

//timeMode indicates what mode time is currently running in.
var timeMode = 0;
var timeMode_pause_time = 1; // the time that is paused
var timeMode_speed_rate = 1; // the rate of time relative to realTime
var timeMode_lastSync = 1; // last time time was synced
var timeMode_animate_fromTime = 1;
var timeMode_animate_toTime = 1;

//pushes updated data to local storage (and thus other tabs)
function timeLocalStorageUpdate(){

}

//receives updated data from local storage
function timeLocalStorageReceive(){

}

// non local storage section
// ============================================================================

//1200 years in milliseconds, the assumed "zero" for the time module
var defaultMainTimeOffset = 37868342400000;
//precision limit 2^53-1= 9007199254740992; or about the year 285.420

//timeMode indicates what mode time is currently running in.
const timeModes = Object.freeze({
    NORMAL: 0, //constant offset from realTime to time.
    PAUSED: 1, //offset changes dynamically so time stays still in relation to realTime
    SPEED: 2, //offset changes dynamically so realTime moves at a different rate than realTime.
    ANIMATE: 3, //continuously animates the offset to ease time from and to a goal value.
  });

//helper for common time units
const timeUnits = {
    seconds:     1000,
    minutes:    60000,
    hours:    3600000,
    days:    86400000,
    weeks:  604800000,
    months:2628000000,
    years:31557600000,
  };

// next animation step

// regular event - fires at regular intervals
timeRegularEvent = 0;
timeRegularEvent_period = 1;
timeRegularEvent_periodNominal = 1; // every 1 seconds realTime
timeRegularEvent_periodMax = 2; // every 2 seconds realTime
timeRegularEvent_periodMin = 0.5; // every 0.5 seconds realTime


//get current in universe time
function getCurrentTime() {
    realTime = Date.now();

    if (timeMode===timeModes.PAUSED) { //time is paused, update offset
        mainTimeOffset = timeMode_pause_time - realTime - defaultMainTimeOffset;
        //mainTimeOffset = time - realTime;

    } else if (timeMode===timeModes.SPEED) {
        // time is running at a modified rate, calculate appropriate offset
        var realTimeDelta = realTime - timeMode_lastSync;
        mainTimeOffset = mainTimeOffset - realTimeDelta + (realTimeDelta * timeMode_speed_rate);


    } else if (timeMode===timeModes.ANIMATE) {
        //handle animation
        //has animation reached the end, if so switch to normal
        //otherwise interpolate current point in animation.
        
        // time is running at a modified rate, calculate appropriate offset
        instantRate = animationInstantRate();
        var realTimeDelta = realTime - timeMode_lastSync;
        mainTimeOffset = mainTimeOffset - realTimeDelta + (realTimeDelta * instantRate);

    }
    //timeMode=timeModes.NORMAL will only run this part
    time = realTime + defaultMainTimeOffset + mainTimeOffset;
    timeMode_lastSync = realTime;
    
    return time;
}




//calculates the rate/speed of time in a given moment, given an animation
function animationInstantRate(currentTime,toTime,fromTime,maxRate,maxDuration){
    
    //max jerk, or change of rate of acceleration of speed
    //var maxJerk = 2;
    
    if (maxRate === undefined || maxRate === null || typeof maxRate !== 'number'){
        maxRate=null;
    }

    if (maxDuration === undefined || maxDuration === null || typeof maxDuration !== 'number'){
        maxDuration=null;
    }

    //calculate position in animation 0-1
    var deltaTime = toTime - fromTime;
    var deltaTime_elapsed = currentTime - fromTime;
    var animationPosition = deltaTime_elapsed/deltaTime;
    //modify with ease in/out
    animationPosition = easeInOutQuart(animationPosition);
    //scale to correct time
    var returnTime = animationPosition * deltaTime;
    //
    
    //easeInOutQuart from https://easings.net/#easeInOutQuart
    // takes input 0 to 1, and gives output 0 to 1 but with ease in and out
    function easeInOutQuart(x) {
        return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    }

    //if max rate is provided, and max duration is not;
    // = run at max rate for whatever duration is necessary.

    //if max duration is provided, and max rate is not;
    // = run at rate that gives max duration.

    //if max duration and max rate is provided,
    // = find solution within limits, if that is not possible;
    // = compromise on both equally.

    //if neither max duration nor max rate is provided;
    // = assume default max rate and max duration.

}

//get current real time
function getCurrentRealTime() {
    getCurrentTime()
    return realTime;
}

//get the current time offset
function getTimeOffset() {
    getCurrentTime()
    return mainTimeOffset;
}

//set the active time offset to provided value.
function timeSetOffset(newOffset=0) {
    //if paused, update the paused time
    if (timeMode===timeModes.PAUSED) {
        timeLocalStorageUpdate();
        timeMode_pause_time = realTime + defaultMainTimeOffset + newOffset;
    }
    mainTimeOffset=newOffset;
    timeLocalStorageUpdate();
}

//set the active time offset to make time a specific value.
function timeSet(newTime=0) {
    //if in the middle of an animation, adjust the end point instead
    if (timeMode===timeModes.ANIMATE) {
        setTimeAnimate(timeMode_animate_toTime+timeJumpOffset);
        return;
    }

    mainTimeOffset = newTime - (realTime + defaultMainTimeOffset);
    timeLocalStorageUpdate();
}

//jump forwards or backwards in time
function timeJump(timeJumpOffset=0) {
    //if paused, update the paused time
    if (timeMode===timeModes.PAUSED) {
        timeLocalStorageUpdate();
        timeMode_pause_time += timeJumpOffset;
    }
    //if in the middle of an animation, adjust the end point instead
    else if (timeMode===timeModes.ANIMATE) {
        setTimeAnimate(timeMode_animate_toTime+timeJumpOffset);
        return;
    }

    mainTimeOffset += timeJumpOffset;
    timeLocalStorageUpdate();
}

//sets time mode to normal
function setTimeNormal(){
    //if time is running at a modified rate, update the mainTimeOffset first
    if (timeMode===timeModes.SPEED) {
        getCurrentTime();
    }
    // or if time is paused, update the mainTimeOffset first
    else if (timeMode===timeModes.PAUSED) {
        getCurrentTime();
    }
    // or if time is being animated, update the mainTimeOffset first
    else if (timeMode===timeModes.ANIMATE) {
        getCurrentTime();
    }
    //set mode to normal
    timeMode=timeModes.NORMAL;
    timeMode_speed_rate = 1;
    timeLocalStorageUpdate();
}

//pauses time
function setTimePaused(){
    var currentTime = getCurrentTime();
    timeMode_pause_time = currentTime;
    timeMode=timeModes.PAUSED;
    timeLocalStorageUpdate();
}

//set the speed time runs at relative to realTime
function setTimeSpeed(rate=1){
    getCurrentTime();
    timeMode_speed_rate = rate;
    timeMode=timeModes.SPEED;
    timeLocalStorageUpdate();
}

//set time to animate to a new time.
function setTimeAnimate(toTime,fromTime,maxRate=4,maxDuration=1*timeUnits.minutes){
    //If already in an animation, adjust current animation instead.
    if (timeMode===timeModes.ANIMATE) {
        //adjust here
    }

    if (fromTime === undefined || fromTime === null || typeof fromTime !== 'number'){
        fromTime = getCurrentTime;
    }
    timeMode_animate_fromTime = fromTime;
    timeMode_animate_toTime = toTime;
    timeMode=timeModes.ANIMATE;
    timeLocalStorageUpdate();
}

//find a the relative time between two times
function timeLeft(toTime,fromTime){
    if (fromTime === undefined || fromTime === null || typeof fromTime !== 'number'){
        fromTime = getCurrentTime;
    }
    //find delta
    //return milliseconds
}

//format time to days, hours, minutes, and seconds 
function timeToString(unixTime){
}

//format time to a ISO8601 string
function timeToISO8601(unixTime){
    const date = new Date(unixTime);
    return date.toISOString();
}

//generate QR code to share current time 
function timeQR(){

}