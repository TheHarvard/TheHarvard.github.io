
// Function to get URL parameters
function cf_getUrlParameters() {
    const params = new URLSearchParams(window.location.search);
    const paramObject = {};
    params.forEach((value, key) => {
        paramObject[key] = value;
    });
    return paramObject;
}

// Function to show or hide elements based on URL parameters
function cf_toggleElements() {
    const params = cf_getUrlParameters();
    
    // Hide elements with hideIf attribute
    document.querySelectorAll('[hideIf]').forEach(element => {
        const paramName = element.getAttribute('hideIf');
        if (params[paramName] !== undefined) {
            element.style.display = 'none';
        }
    });

    // Show elements with showIf attribute
    document.querySelectorAll('[showIf]').forEach(element => {
        const paramName = element.getAttribute('showIf');
        if (params[paramName] !== undefined) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
}

// Call the cf_toggleElements function
cf_toggleElements;

// Call the cf_toggleElements function on window load, show and visibility change
window.onpageshow = function() {
    cf_toggleElements();
}
window.onfocus = function() {
    cf_toggleElements();
};
document.addEventListener("visibilitychange", function() {
    cf_toggleElements();
});
