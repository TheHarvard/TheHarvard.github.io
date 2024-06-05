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
function setColourwayFromCookie() {
    var cookieColourway = getCookie('colourwayCss');
    if (cookieColourway) {
        document.getElementById('colourwayCss').href = cookieColourway;
    }
}

// Apply the saved stylesheet when the page loads
window.onpageshow = function() {
    setColourwayFromCookie();
}

// and on focus and visibility changes
window.onfocus = function() {
    setColourwayFromCookie();
};
document.addEventListener("visibilitychange", function() {
    setColourwayFromCookie();
});

setColourwayFromCookie();
console.log("setColourwayFromCookie complete");