
let currentColourway = "";

// Function to set a cookie
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to switch the stylesheet
function setColourway(sheet) {
    document.getElementById('colourwayCss').href = sheet;
    setCookie('colourwayCss', sheet, 30); // Save the selected stylesheet for 30 days
}

// Function to apply the saved stylesheet on page load
function setColourwayFromCookie(triggerEvent=false) {
    var newColourway = "";
    var element = document.getElementById('colourwayCss');
    var cookieColourway = getCookie('colourwayCss');

    //Will run after the css is fully loaded:
    function onColourwayLoad() {
        console.log('Stylesheet has finished loading');

        //fire event on change in colourway
        if (triggerEvent&&(currentColourway !== newColourway)) {
            console.log("setColourwayFromCookie: colorway_change_event triggered")
            
            var colorway_change_event = new CustomEvent('colorway_change', { detail: newColourway });
            document.dispatchEvent(colorway_change_event);
        }
        //update currentColourway
        currentColourway = newColourway;

        // Remove the event listener after it has been triggered
        element.removeEventListener('load', onColourwayLoad);
    }

    element.addEventListener('load', onColourwayLoad);


    //will run first
    if (cookieColourway && cookieColourway.startsWith('../css/') && cookieColourway.endsWith('.css')) {
        newColourway = cookieColourway;
        element.href = newColourway;
    } else {
        newColourway = '../css/colourwayAmber.css';
        element.href = newColourway;
        
    }

}

// Apply the saved stylesheet when the page loads
window.onpageshow = function() {
    setColourwayFromCookie(true);
}

// and on focus and visibility changes
window.onfocus = function() {
    setColourwayFromCookie(true);
};

document.addEventListener("visibilitychange", function() {
    setColourwayFromCookie(true);
});

setColourwayFromCookie();
console.log("setColourwayFromCookie complete");



// interfacing functions

function getColourWayProperty(propertyName) {
    //var value = getComputedStyle(document.documentElement).getPropertyValue(propertyName).trim();
    var value = getComputedStyle(document.documentElement).getPropertyValue(propertyName);
    //console.log("getColourWayProperty - getting: ", propertyName, " found: ", value)
    //console.log("getComputedStyle(document.documentElement): ",getComputedStyle(document.documentElement))
    return value;
}

