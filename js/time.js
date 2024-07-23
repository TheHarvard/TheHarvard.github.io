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
var timeMode_animate_fromRealTime = 1;
var timeMode_animate_toRealTime = 1;
var timeMode_animate_startSpeed = 1;
var timeMode_animate_endSpeed = 1;


//data structure for storing variables to local storage
var timeData = {
    realTime: 0,
    time: 0,
    mainTimeOffset: 0,
    timeMode: 0,
    timeMode_pause_time: 1,
    timeMode_speed_rate: 1,
    timeMode_lastSync: 1,
    timeMode_animate_fromTime: 1,
    timeMode_animate_toTime: 1,
    timeMode_animate_fromRealTime: 1,
    timeMode_animate_toRealTime: 1,
    timeMode_animate_startSpeed: 1,
    timeMode_animate_endSpeed: 1
};


//pushes updated data to local storage (and thus other tabs)
function timeLocalStorageUpdate(){
    timeData.realTime                       =realTime;
    timeData.time                           =time;
    timeData.mainTimeOffset                 =mainTimeOffset;
    timeData.timeMode                       =timeMode;
    timeData.timeMode_pause_time            =timeMode_pause_time;
    timeData.timeMode_speed_rate            =timeMode_speed_rate;
    timeData.timeMode_lastSync              =timeMode_lastSync;
    timeData.timeMode_animate_fromTime      =timeMode_animate_fromTime;
    timeData.timeMode_animate_toTime        =timeMode_animate_toTime;
    timeData.timeMode_animate_fromRealTime  =timeMode_animate_fromRealTime;
    timeData.timeMode_animate_toRealTime    =timeMode_animate_toRealTime;
    timeData.timeMode_animate_startSpeed    =timeMode_animate_startSpeed;
    timeData.timeMode_animate_endSpeed      =timeMode_animate_endSpeed;
    localStorage.setItem('timeData', JSON.stringify(timeData));
}

//receives updated data from local storage
function timeLocalStorageReceive(){
    var storedData = localStorage.getItem('timeData');
    if (storedData) {
        timeData = JSON.parse(storedData);
        realTime                       =timeData.realTime;
        time                           =timeData.time;
        mainTimeOffset                 =timeData.mainTimeOffset;
        timeMode                       =timeData.timeMode;
        timeMode_pause_time            =timeData.timeMode_pause_time;
        timeMode_speed_rate            =timeData.timeMode_speed_rate;
        timeMode_lastSync              =timeData.timeMode_lastSync;
        timeMode_animate_fromTime      =timeData.timeMode_animate_fromTime;
        timeMode_animate_toTime        =timeData.timeMode_animate_toTime;
        timeMode_animate_fromRealTime  =timeData.timeMode_animate_fromRealTime;
        timeMode_animate_toRealTime    =timeData.timeMode_animate_toRealTime;
        timeMode_animate_startSpeed    =timeData.timeMode_animate_startSpeed;
        timeMode_animate_endSpeed      =timeData.timeMode_animate_endSpeed;
    }
}

// Initial load from local storage
timeLocalStorageReceive();

// Listen for changes in local storage and update variables accordingly
window.addEventListener('storage', function(event) {
    if (event.key === 'timeData') {
        timeLocalStorageReceive();
    }
});

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
    second:      1000,
    seconds:     1000,
    minute:     60000,
    minutes:    60000,
    hour:     3600000,
    hours:    3600000,
    day:     86400000,
    days:    86400000,
    week:   604800000,
    weeks:  604800000,
    month: 2628000000,
    months:2628000000,
    year: 31557600000,
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
        //time is animated, consult the animation function
        var animateTime = calculateAnimatedTime(
                realTime,
                timeMode_animate_fromRealTime,
                timeMode_animate_toRealTime,
                timeMode_animate_fromTime,
                timeMode_animate_toTime,
                1,
                1);

                

                /*
                if (timeMode_animate_fromTime<=timeMode_animate_toTime) {
                    var animationDone = (animateTime >= timeMode_animate_toTime);
                }
                else {
                    var animationDone = (animateTime < timeMode_animate_toTime);
                    console.log ("NOTICE ME ! ",animateTime,timeMode_animate_toTime);
                }
                    */

        var positionInAnimation=(realTime-timeMode_animate_fromRealTime)/(timeMode_animate_toRealTime-timeMode_animate_fromRealTime);
        //console.log("positionInAnimation: ",positionInAnimation)
        if (positionInAnimation>=1) {
            // go to normal when the animation is done
            console.log ("animation finished! ");
            //setTimeSpeed(timeMode_speed_rate)

            if (timeMode_speed_rate===1) {
                timeMode=timeModes.NORMAL;
            }
            else if (timeMode_speed_rate===0) {
                timeMode=timeModes.PAUSED;
                timeMode_pause_time = animateTime;
            }
            else {
                timeMode=timeModes.SPEED;
            }

            timeLocalStorageUpdate();
        } 

        mainTimeOffset = animateTime - (realTime + defaultMainTimeOffset);
        

    }
    //timeMode=timeModes.NORMAL will only run this part
    time = realTime + defaultMainTimeOffset + mainTimeOffset;
    timeMode_lastSync = realTime;
    
    return time;
}

//calculates the rate/speed of time in a given moment, given an animation
function calculateAnimatedTime(currentRealTime, fromRealTime, toRealTime, fromTime, toTime, startSpeed = 1, endSpeed = 1) {
    var deltaTime = toTime-fromTime;

    var deltaRealTime=toRealTime-fromRealTime;
    var positionInAnimation=(currentRealTime-fromRealTime)/deltaRealTime;

    //calculate components
    var component_acceleration = fromTime + startSpeed * (currentRealTime-fromRealTime);
    var component_linear = fromTime + positionInAnimation * deltaTime;
    var component_deceleration = toTime + endSpeed * (currentRealTime-toRealTime);

    if      (positionInAnimation<0){return component_acceleration;}
    if      (positionInAnimation>1){return component_deceleration;}
    return component_linear;
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

//set the active time offset to provided value, and animate to it
function timeSetOffsetAnimate(newOffset,duration=5*timeUnits.seconds){
    fromTime = getCurrentTime();
    timeMode_animate_fromTime = fromTime;
    //timeMode_animate_toTime = newOffset + defaultMainTimeOffset + duration*timeMode_speed_rate;
    timeMode_animate_toTime = (fromTime - mainTimeOffset) + newOffset + duration*timeMode_speed_rate;
    timeMode_animate_fromRealTime = realTime;
    timeMode_animate_toRealTime = realTime + duration;
    timeMode=timeModes.ANIMATE;
    timeLocalStorageUpdate();
}

//set the active time offset to make time a specific value.
// WILL BREAK SYNC!
function timeSet(newTime=0) {
    //if in the middle of an animation, adjust the end point instead
    if (timeMode===timeModes.ANIMATE) {
        timeMode_animate_toTime=newTime;
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
        timeMode_animate_toTime+=timeJumpOffset;
        return;
    }

    mainTimeOffset += timeJumpOffset;
    timeLocalStorageUpdate();
}

//jump forwards or backwards in time, but animate it instead of snapping
function timeJumpAnimate(timeJumpOffset,duration=5*timeUnits.seconds){
    fromTime = getCurrentTime();
    timeMode_animate_fromTime = fromTime;
    timeMode_animate_toTime = fromTime + timeJumpOffset + duration*timeMode_speed_rate;
    timeMode_animate_fromRealTime = realTime;
    timeMode_animate_toRealTime = realTime + duration;
    timeMode=timeModes.ANIMATE;
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
    timeMode_speed_rate = 0;
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










//find a the relative time between two times
function timeLeft(toTime,fromTime){
    if (fromTime === undefined || fromTime === null || typeof fromTime !== 'number'){
        fromTime = getCurrentTime;
    }
    //find delta
    //return milliseconds
}

//format time to a ISO8601 string - 22 characters?
function timeToISO8601(unixTime){
    const date = new Date(unixTime);
    return date.toISOString();
}

//format time to a custom compact ISO8601 string - 17 characters
function timeToISO8601_compact(unixTime){
    const ISO8601String = timeToISO8601(unixTime);
    var strippedString = ISO8601String.split('-').join('');
    let stringWithSpaces = strippedString.replace(/T/g, ' ');
    var shortenedString = stringWithSpaces.slice(0, -5);
    return shortenedString;
}

//format time to a custom compact ISO8601 string with weekdays - 22 characters
function timeToISO8601_compact_withDay(unixTime){
    const date = new Date(unixTime);
    const ISO8601String = date.toISOString();
    var strippedString = ISO8601String.split('-').join('');
    var stringWithSpaces = strippedString.replace(/T/g, ' ');
    var shortenedString = stringWithSpaces.slice(0, -5);
    const options = { weekday: 'long' };
    const dayOfWeek = date.toLocaleDateString('en-US', options);
    var stringWithDay = shortenedString + " " + dayOfWeek.substring(0, 3) + ".";
    return stringWithDay;
}

//generate QR code to share current time 
function timeQR(){

}
