
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

    /*
    // keep elements with showAfter attribute, if time has passed
    document.querySelectorAll('[showAfter]').forEach(element => {
        const showAfterTime = element.getAttribute('showAfter');

        // Convert both times to a comparable format (e.g., Date object, or UNIX timestamp)
        const showAfterTimestamp = new Date(showAfterTime).getTime();

        console.log("[showAfter]: ", showAfterTime, " === ", new Date(showAfterTime), " === ", showAfterTimestamp);
    
        if (params.hasOwnProperty("time")) {
            const time = params["time"];
    
            // Convert both times to a comparable format (e.g., Date object, or UNIX timestamp)
            const currentTime = new Date(time).getTime();
    
            if (currentTime >= showAfterTimestamp) {
                console.log("Shown. time=", time, " === ",new Date(time), " === ",currentTime);
            } else {
                element.remove();
                console.log("Hidden. time=", time, " === ",new Date(time), " === ",currentTime);
            }
    
        } else {
            console.log("skipped - url does not have time");
        }
    });
    */




    // Show or hide content based on time
    document.querySelectorAll('[showAfter], [hideAfter], [showBefore], [hideBefore]').forEach(element => {
        
        //moved to saving the file
        

            
        
        
        const attributes = ['showAfter', 'hideAfter', 'showBefore', 'hideBefore'];

        attributes.forEach(attr => {
            if (element.hasAttribute(attr)) {
                const timeValue = element.getAttribute(attr);
                const timeTimestamp = new Date(isNaN(timeValue) ? timeValue : Number(timeValue)).getTime();

                console.log(`[${attr}]: `, timeValue, " === ", new Date(timeTimestamp), " === ", timeTimestamp);

                var time = "";
                if (params.hasOwnProperty("time")) {
                    time = params["time"];
                    console.log("has time property: ",time);
                } else{
                    time = conditionalFormatting_currentUniverseTime;
                    console.log("default to conditionalFormatting_currentUniverseTime: ",conditionalFormatting_currentUniverseTime)
                }
                //console.log("time is: ",time)
                const currentTime = new Date(isNaN(time) ? time : Number(time)).getTime();
                

                // If both target time and current time are valid
                if (!isNaN(timeTimestamp) && !isNaN(currentTime)) {

                    console.log(
                        `${attr} processed. \ncurrentTime   =`, new Date(isNaN(time) ? time : Number(time)), " === ", time, " === ", currentTime,
                         "\ntimeTimestamp =", new Date(isNaN(timeValue) ? timeValue : Number(timeValue)), " === ", timeValue, " === ", timeTimestamp);

                    if (currentTime >= timeTimestamp) {
                        if (attr === 'hideAfter' || attr === 'showBefore') {
                            element.remove();
                        }
                    } else {
                        if (attr === 'showAfter' || attr === 'hideBefore') {
                            element.remove();
                        }
                    }

                } else {
                    if (attr === 'showAfter' || attr === 'showBefore') {
                        // Default behavior is to hide "show" and show "hide" tags
                        element.remove();
                    }
                    console.log(`${attr} skipped due to invalid time values.`);
                }
            }
        });
    });



}

//hardcodes the currently used "current time" to the url for archival of the
//current state of the conditional formatting. 
function conditionalFormatting_addTimeToURL(){
    const params = cf_getUrlParameters();
    //add time to the url
    if (!params.hasOwnProperty("time")) {
        // Create a new URL object based on the current URL
        const url = new URL(window.location.href);
        
        // Set the 'time' parameter to 0
        url.searchParams.set('time', timeToISO8601(conditionalFormatting_currentUniverseTime));
        
        // Update the URL in the browser without reloading the page
        window.history.replaceState({}, '', url);
        
        // Reload the page to apply the new time-based formatting
        window.location.reload();
    }
}

// Updates the time stored in the URL to the current time or supplied time,
// and reloads the page to re-apply conditional formatting with the new time.
function conditionalFormatting_updateURLTime_andReload(newTime_passed) {
    // Create a new URL object based on the current URL
    const url = new URL(window.location.href);

    // Check if the "time" parameter exists in the URL, if not, add it
    //if (!url.searchParams.has("time")) {
    //    conditionalFormatting_addTimeToURL(); // Assuming this function adds the 'time' parameter
    //}

    // Determine the new time to be set
    let newTime = "";
    if (typeof newTime_passed === 'string') {
        newTime = newTime_passed;
    } else {
        newTime = timeToISO8601(getCurrentTime());
    }

    // Update the "time" parameter in the URL
    url.searchParams.set('time', newTime);

    // Update the URL without reloading the page
    window.history.replaceState({}, '', url);

    // Reload the page to apply the new time-based formatting
    window.location.reload();
}

// Removes the url time, making the document a live document.
function conditionalFormatting_removeURLTime_andReload() {
    // Create a new URL object based on the current URL
    const url = new URL(window.location.href);

    // Remove the specified parameter
    url.searchParams.delete('time');

    // Update the URL without reloading the page
    window.history.replaceState({}, '', url);

    // Reload the page to apply the new time-based formatting
    window.location.reload();
}






console.log("conditionalFormatting.js called")
var conditionalFormatting_currentUniverseTime = getCurrentTime();
// Call the cf_toggleElements function only on page load.
conditionalFormatting_update();

console.log("conditionalFormatting.js- checking rotation")

const match = document.cookie.match(/(?:^|;\s*)renderrot=(90|180|270)/);
if (match) {
    const angle = parseInt(match[1], 10);
    console.log("rotating " + angle);
    applyRotation(angle);
}

console.log("conditionalFormatting.js complete")





// apply the rotation
function applyRotation(angle) {
  // Only wrap once
  let wrapper = document.getElementById("page-rotator");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "page-rotator";

    // Move body children into wrapper (but not ::before background)
    while (document.body.firstChild) {
      wrapper.appendChild(document.body.firstChild);
    }
    document.body.appendChild(wrapper);

    // Body stays as your styled canvas
    document.body.style.overflow = "hidden"; // avoid double scrollbars
  }

  // Reset first
  wrapper.style.transform = "";
  wrapper.style.width = "";
  wrapper.style.height = "";
  wrapper.style.left = "";
  wrapper.style.top = "";

  // Apply orientation
  wrapper.style.position = "absolute";
  wrapper.style.transformOrigin = "top left";

  if (angle === 90) {
    wrapper.style.transform = "rotate(90deg)";
    wrapper.style.width = "80vh";
    wrapper.style.height = "92vw";
    wrapper.style.left = "98vw";
    wrapper.style.top = "2vh";
    wrapper.style.fontSize = "2vh";
    wrapper.style.lineHeight = "2.6vh";
    wrapper.style.overflowX  = "scroll";
    wrapper.style.overflowY  = "visible";
  } else if (angle === 180) {
    wrapper.style.transform = "rotate(180deg)";
    wrapper.style.width = "92vw";
    wrapper.style.height = "80vh";
    wrapper.style.left = "98vw";
    wrapper.style.top = "98vh";
    wrapper.style.overflowX  = "visible";
    wrapper.style.overflowY  = "scroll";
  } else if (angle === 270) {
    wrapper.style.transform = "rotate(270deg)";
    wrapper.style.width = "80vh";
    wrapper.style.height = "92vw";
    wrapper.style.left = "2vh";
    wrapper.style.top = "98vw";
    wrapper.style.fontSize = "2vh";
    wrapper.style.lineHeight = "2.6vh";
    wrapper.style.overflowX  = "scroll";
    wrapper.style.overflowY  = "visible";
  }

  // remap scroll if sideways
  if (angle === 90 || angle === 270) {
    return;
    document.addEventListener("wheel", function(e) {
      if (e.shiftKey) return;
      window.scrollBy({ left: e.deltaY, top: 0 });
      e.preventDefault();
    }, { passive: false });
  }
}

// listen for keyboard shortcut to rotate render
  document.addEventListener("keydown", function(e) {
    if (!(e.ctrlKey && e.shiftKey)) return;

    switch (e.key) {
      case "ArrowRight": setRotation(90); break;
      case "ArrowDown":  setRotation(180); break;
      case "ArrowLeft":  setRotation(270); break;
      case "ArrowUp":    setRotation(0); break; // reset
    }
  });

  function setRotation(angle) {
    document.cookie = "renderrot=" + angle + "; path=/";
    location.reload();
  }


  