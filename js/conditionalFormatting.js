
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
    
    // remove elements with hideIf attribute
    document.querySelectorAll('[hideIf]').forEach(element => {
        const paramName = element.getAttribute('hideIf');
        if (params[paramName] !== undefined) {
            //element.style.display = 'none';
            element.remove();
        }
    });

    // keep elements with showIf attribute
    document.querySelectorAll('[showIf]').forEach(element => {
        const paramName = element.getAttribute('showIf');
        if (params[paramName] !== undefined) {
            //element.style.display = 'block';
        } else {
            //element.style.display = 'none';
            element.remove();
        }
    });

    // Replace content based on replaceWith attribute
    document.querySelectorAll('[replaceWith]').forEach(element => {
        const paramName = element.getAttribute('replaceWith');
        if (params.hasOwnProperty(paramName)) {
            element.textContent = params[paramName];
        } else {
            // If the parameter is not in the URL, do not change the content
            // element.textContent remains as is
        }
    });
}

// Call the cf_toggleElements function only on page load.
conditionalFormatting_update();
