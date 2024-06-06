
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
function conditionalFormatting_update() {
    const params = cf_getUrlParameters();
    console.log("params: ",params)
    
    // remove elements with hideIf attribute
    document.querySelectorAll('[hideIf]').forEach(element => {
        const paramName = element.getAttribute('hideIf');
        console.log("[hideIf]: ",element);
        if (params[paramName] !== undefined) {
            //element.style.display = 'none';
            element.remove();
            console.log("Removed!");

        }
    });

    // keep elements with showIf attribute
    document.querySelectorAll('[showIf]').forEach(element => {
        const paramName = element.getAttribute('showIf');
        console.log("[showIf]: ",element);
        if (params[paramName] !== undefined) {
            //element.style.display = 'block';
            console.log("Spared.");
        } else {
            //element.style.display = 'none';
            element.remove();
            console.log("Removed!");
        }
    });

    // Replace content based on replaceWith attribute
    document.querySelectorAll('[replaceWith]').forEach(element => {
        const paramName = element.getAttribute('replaceWith');
        console.log("[replaceWith]: ",element);
        if (params.hasOwnProperty(paramName)) {
            element.textContent = params[paramName];
            console.log("Replaced!");
        } else {
            // If the parameter is not in the URL, do not change the content
            // element.textContent remains as is
            console.log("not replaced.");
        }
    });
}

console.log("conditionalFormatting.js called")
// Call the cf_toggleElements function only on page load.
conditionalFormatting_update();
console.log("conditionalFormatting.js complete")
