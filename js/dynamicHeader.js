// Function to set a cookie
function DHsetCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
function DHgetCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// DH functions
// setDH sets a DH of specified name to a provided value.
// If the specified DH does not exist, it is created and set to the value.
// DHs are stored in the cookie "DH_list"
function setDH(name, URL, size, actions, driveLetter) {
    var dhList = getDHList();
    var found = false;
    if (typeof driveLetter === 'undefined') {
        driveLetter = "C"
    }
    for (var i = 0; i < dhList.length; i++) {
        if (dhList[i].name === name) {
            dhList[i].URL = URL;
            dhList[i].size = size;
            dhList[i].actions = actions;
            dhList[i].driveLetter = driveLetter;
            found = true;
            break;
        }
    }
    if (!found) {
        dhList.push({ name: name, URL: URL, size: size, actions: actions, driveLetter: driveLetter, });
    }
    //console.log("setDH actions", actions);
    //console.log("setDH dhList", dhList);
    //console.log("setDH JSON.stringify(dhList))", JSON.stringify(dhList));
    DHsetCookie("DH_list", JSON.stringify(dhList), 365);
    dynamicHeader_update();
}

// getDH returns the values stored in a DH. If the DH does not exist it returns null.
function getDH(name) {
    var dhList = getDHList();
    for (var i = 0; i < dhList.length; i++) {
        if (dhList[i].name === name) {
            return dhList[i];
        }
    }
    return null;
}

// clearDH erases the DH.
function clearDH(name) {
    var dhList = getDHList();
    for (var i = 0; i < dhList.length; i++) {
        if (dhList[i].name === name) {
            dhList.splice(i, 1);
            break;
        }
    }
    DHsetCookie("DH_list", JSON.stringify(dhList), 365);
    dynamicHeader_update();
}

// Utility function to get DH list from cookie
function getDHList() {
    var dhListCookie = DHgetCookie("DH_list");
    return dhListCookie ? JSON.parse(dhListCookie) : [];
}

// Function to clear all DHs
function clearAllDH() {
    DHsetCookie("DH_list", "", -1); // Set cookie with an expired date to clear it
    dynamicHeader_update();
}

// Function to clear all DHs of given drive letter
function clearDriveLetter(driveLetter) {

    // Retrieve DH list
    let dhList = getDHList();
    dhList.forEach(function(dh) {
        if (dh.driveLetter===driveLetter){
            clearDH(dh.name);
        }
    });
}

// returns true if drive letter has entries in it
function hasDriveLetter(driveLetter) {

    // Retrieve DH list
    let dhList = getDHList();
    dhList.forEach(function(dh) {
        if (dh.driveLetter===driveLetter){
            return true;
        }
    });
    return false;
}


//==============================================================================



//var currentPage_actions = "";

// Set up header
function dynamicHeader_update() {
    let cookieName = "dynamicHeader";
    let cookieValue = DHgetCookie(cookieName);

    let headerContent = ''; // Initialize header content
    let sumSize = 0; // Initialize sum of size integers
    let totalSize = 64; // Initialize total size
    let targetWidth = 25; // Target width for DH name and size

    // Retrieve DH list
    let dhList = getDHList();
    
    headerContent += "<summary>VNA DECK A33.76<br>================================================================================</summary>";
    //headerContent += "A: (M-DISK drive 1)<br>";

    //Start with A open if there are A files
    if (hasDriveLetter("A")) {
        headerContent += `<details open=""><summary>A: (M-DISK)</summary>`;
    }else{
        headerContent += `<details><summary>A: (M-DISK)</summary>`;
    }

    // set up A: disk

    dhList.forEach(function(dh) {
        
        
        if (dh.driveLetter==="A"){
            
            
            // Check if name exceeds target width
            let staticLength = 6 + dh.size.toString().length + 4; // length of "├─ - KB"
            let availableWidth = targetWidth - staticLength;
            
            // Check if name exceeds available width
            let truncatedName = dh.name.length > availableWidth ? dh.name.substring(0, availableWidth - 3) + "..." : dh.name;
            let nameSize = `├─${truncatedName} - ${dh.size} KB`;
            let paddingLength = targetWidth - nameSize.length;
            let padding = '-'.repeat(paddingLength);
            let summaryContent = `<summary>├─${truncatedName} ${padding} ${dh.size} KB</summary>`;
            let linkContent ="";
            //add dh actions
            //console.log(dh.name,dh.actions);
            if (Array.isArray(dh.actions)){
                //console.log("IS AN ARRAY!");
                dh.actions.forEach(function(dhAction){
                    
                    linkContent +=`│ ├─<button onclick="${dhAction.script}">[ ${dhAction.name} ]</button><br>`;
                    
                })
            }
            
            linkContent += `│ └─<a href="${dh.URL}">[ Open ]</a><br>`;

            //linkContent += `│ └─<button onclick="clearDH_buttonWithConfirm('${dh.name}')">[ Delete ]</button><br>`;
            headerContent += `<details>${summaryContent}${linkContent}</details>`;
            //sumSize += parseInt(dh.size); // Update sum of size integers
            //console.log("name: ",dh.name," size: ",dh.size, " sumSize: ",sumSize)
        }
    });
    headerContent += `└─<button onclick="clearDriveLetter('A')">[ Eject ]</button><br>`;
    headerContent += `</details>`;
    //headerContent += `<br>`;
    
    //headerContent += "B: (M-DISK drive 2)<br>";
    headerContent += "<details><summary>B: (M-DISK)</summary>";

    headerContent += `└─<button onclick="clearDriveLetter('B')">[ Eject ]</button><br>`;
    headerContent += `</details>`;
    //headerContent += `<br>`;
    
    //headerContent += "C: (Paralelle Delay-Line Memory)<br>";
    headerContent += `<details open=""><summary>C: (Internal)</summary>`;

    // Add details and summary for each DH element to header content
    //console.log("starting...")
    dhList.forEach(function(dh) {
        
        
        if (dh.driveLetter==="C"){

            
            // Check if name exceeds target width
            let staticLength = 6 + dh.size.toString().length + 4; // length of "├─ - KB"
            let availableWidth = targetWidth - staticLength;
            
            // Check if name exceeds available width
            let truncatedName = dh.name.length > availableWidth ? dh.name.substring(0, availableWidth - 3) + "..." : dh.name;
            let nameSize = `├─${truncatedName} - ${dh.size} KB`;
            let paddingLength = targetWidth - nameSize.length;
            let padding = '-'.repeat(paddingLength);
            let summaryContent = `<summary>├─${truncatedName} ${padding} ${dh.size} KB</summary>`;
            let linkContent = `│ ├─<a href="${dh.URL}">[ Open ]</a><br>`;

            //add dh actions
                //console.log(dh.name,dh.actions);
            if (Array.isArray(dh.actions)){
                //console.log("IS AN ARRAY!");
                dh.actions.forEach(function(dhAction){

                    linkContent +=`│ ├─<button onclick="${dhAction.script}">[ ${dhAction.name} ]</button><br>`;

                })
            }
        

            linkContent += `│ └─<button onclick="clearDH_buttonWithConfirm('${dh.name}')">[ Delete ]</button><br>`;
            headerContent += `<details>${summaryContent}${linkContent}</details>`;
            sumSize += parseInt(dh.size); // Update sum of size integers
            //console.log("name: ",dh.name," size: ",dh.size, " sumSize: ",sumSize)
        }
    });
    //console.log("done! sumSize: ",sumSize)

    // Calculate padding for the last item
    let lastItemPadding = '-'.repeat(targetWidth - `├─ <Free> - ${totalSize-sumSize}KB/${totalSize}KB`.length);

    // Construct HTML string for the last item
    let lastItem = `└─ &lt;Free&gt; ${lastItemPadding} ${totalSize-sumSize}KB/${totalSize}KB<br>`;


    // Add last item to header content
    //headerContent += `│<br>`;
    headerContent += lastItem;
    headerContent += `</details>`;

        //headerContent += "B: (M-DISK drive 2)<br>";
        headerContent += "<details><summary>D: (Network)</summary>";

        headerContent += `└─&lt;Disconnected&gt`;
        headerContent += `</details>`;
        //headerContent += `<br>`;

    //headerContent += "H:// Network Interface 1<br>";
    //headerContent += "N:// Network Interface 2<br>";

    headerContent += `<br>`;
    headerContent += `Open:<br>`;

    // Generate entry for current document
    let dh = DH_get_currentPage()

    //check if there is enough memory available to store this file, otherwise
    //disable the save button on this refresh
    let saveButtonDisableAttribute  = "";
    let saveButtonText  = "Save";
    if (sumSize+parseInt(dh.size) > totalSize){
        saveButtonDisableAttribute  = "disabled";
        saveButtonText  = "Save: MEMORY ERROR";
    }

    // Check if name exceeds target width
    let staticLength = 6 + dh.size.toString().length + 4; // length of "├─ - KB"
    let availableWidth = targetWidth - staticLength;
    
    // Check if name exceeds available width
    let truncatedName = dh.name.length > availableWidth ? dh.name.substring(0, availableWidth - 3) + "..." : dh.name;
    let nameSize = `└─${truncatedName} - ${dh.size} KB`;
    let paddingLength = targetWidth - nameSize.length;
    let padding = '-'.repeat(paddingLength);
    let summaryContent = `<summary>└─${truncatedName} ${padding} ${dh.size} KB</summary>`;
    

    let linkContent="";

    //add dh actions
    //console.log(dh.name,dh.actions);
    if (Array.isArray(dh.actions)){
        //console.log("IS AN ARRAY!");
        dh.actions.forEach(function(dhAction){

            linkContent +=`&nbsp; ├─<button onclick="${dhAction.script}">[ ${dhAction.name} ]</button><br>`;

        })
    }

    linkContent += `&nbsp; └─<button onclick="DH_save_currentPage()" ${saveButtonDisableAttribute}>[ ${saveButtonText} ]</button><br>`;
    
    headerContent += `<details>${summaryContent}${linkContent}</details>`;

    //add seperating line
    headerContent += `================================================================================`;

    // Update dynamicHeader element with header content
    document.getElementById("dynamicHeader").innerHTML = headerContent;
}




//create DH entry from current page
function DH_get_currentPage(){
    let dh = {
        name: "",
        url: window.location.href,
        size: 0,
        actions:[],
        driveLetter:"C"
    };
    
    let element = document.getElementById("content");
    if (element) {
        let htmlContent = element.outerHTML;
        let sizeInBytes = new TextEncoder().encode(htmlContent).length;
        let sizeInKB = (sizeInBytes / 1024).toFixed(0);
        //console.log("Calculated size: ",sizeInKB);
        dh.size = sizeInKB;
    }

    
    {
        // Scoped block to check/calculate title, size and actions
        const nameElement = document.querySelector('title');
        if (nameElement) {
        dh.name = nameElement.textContent;
        } 
        const sizeElement = document.querySelector('size');
        if (sizeElement) {
        dh.size = sizeElement.textContent;
        } 
        const actionsElement = document.querySelector('actions');
        if (actionsElement) {
        //console.log("actions: ",actionsElement.textContent)
        dh.actions = JSON.parse(actionsElement.textContent);
        //console.log("actions parsed: ",dh.actions)
        } 
    }
    
    {
        //add parameter to url (skip if allready there)
        const urlObj = new URL(dh.url);
        if (!urlObj.searchParams.has('fromDH')) {
            // Append the "fromDH" parameter to the URL
            urlObj.searchParams.append('fromDH', '');
            dh.url = urlObj.toString();
        }
        }

    return dh;
}

// Create DH entry from an external page
function DH_get_externalPage(url) {
    let dh = {
        name: "",
        url: url,
        size: 0,
        actions: [],
        driveLetter: "C"
    };

    // Use XMLHttpRequest to fetch the external page content synchronously
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, false); // `false` makes the request synchronous
    xhr.send(null);

    if (xhr.status === 200) {
        let htmlContent = xhr.responseText;

        // Create a DOM parser to parse the fetched HTML content
        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlContent, 'text/html');

        // Calculate the size of the content
        let sizeInBytes = new TextEncoder().encode(htmlContent).length;
        let sizeInKB = (sizeInBytes / 1024).toFixed(0);
        dh.size = sizeInKB;

        // Extract the title, size, and actions
        const nameElement = doc.querySelector('title');
        if (nameElement) {
            dh.name = nameElement.textContent;
        }
        const sizeElement = doc.querySelector('size');
        if (sizeElement) {
            dh.size = sizeElement.textContent;
        }
        const actionsElement = doc.querySelector('actions');
        if (actionsElement) {
            dh.actions = JSON.parse(actionsElement.textContent);
        }

        // Add parameter to URL (skip if already there)
        const urlObj = new URL(dh.url);
        if (!urlObj.searchParams.has('fromDH')) {
            // Append the "fromDH" parameter to the URL
            urlObj.searchParams.append('fromDH', '');
            dh.url = urlObj.toString();
        }
    } else {
        console.error('Failed to fetch the page:', xhr.statusText);
    }

    return dh;

    // Example usage:
    //let dhEntry = DH_get_externalPage('https://example.com/page');
    //console.log(dhEntry);

}



//save the current page to "memory" - html button friendly macro
function DH_save_currentPage(){
    let dh=DH_get_currentPage();
    setDH(dh.name,dh.url,dh.size,dh.actions, "C")
}

//"Are you sure?" delete button behaviour
function clearDH_buttonWithConfirm(dhName) {
    var button = document.querySelector('button[onclick="clearDH_buttonWithConfirm(\'' + dhName + '\')"]');
    
    if (button.innerHTML === '[ Delete ]') {
        button.innerHTML = '[ Are you sure? ]';
    } else {
        clearDH(dhName)
    }
}





//update url parameters - to be used by DH actions
function updateUrlAndReload(params) {
    // Get the current URL
    let currentUrl = new URL(window.location.href);
    
    // Add each parameter to the URL
    Object.keys(params).forEach(key => {
        currentUrl.searchParams.set(key, params[key]);
    });

    // Reload the page with the new URL
    window.location.href = currentUrl.toString();

    // Example usage:
    // updateUrlAndReload({ param1: 'value1', param2: 'value2' });
}




//check for "onDisk" url parameter, and process it
// Main function to process the "onDisk" parameter
function processOnDiskParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const onDiskParam = urlParams.get('onDisk');

    if (onDiskParam) {
        console.log("onDisk is present! processing:");
        try {
            // Attempt to parse as JSON array
            let urlList = JSON.parse(onDiskParam);

            // If onDiskParam is not an array, create an array with the single value
            if (!Array.isArray(urlList)) {
                urlList = [onDiskParam];
            }

            //Remove old disk dh entries
            clearDriveLetter('A');

            // Loop over each URL in the list
            urlList.forEach(url => {
                if (typeof url === 'string') {
                    console.log(`Processing URL from list: ${url}`);
                    // Add your URL processing logic here
                    
                    //console.log(`url:`, url);
                    let fullUrl = window.location.href.replace(/\?.*/, ''); // Remove anything after "?"
                    fullUrl = fullUrl.replace(/\/[^\/]*\/[^\/]*$/, ''); // Remove last two path segments
                    //console.log(`base url:`, fullUrl);
                    fullUrl = fullUrl + url;
                    

                    //console.log(`window.location.origin:`, window.location.origin);
                    //console.log(`window.location.host:`, window.location.host);
                    //console.log(`window.location.href:`, window.location.href);

                    console.log(`full Url:`, fullUrl);

                    let dh = DH_get_externalPage(fullUrl);
                    console.log("dh: ", dh);
                    if (dh) {
                        //add dh as a disk entry
                        console.log("added: ", dh);
                        dh.driveLetter = "A:"
                        setDH("A:"+dh.name,dh.url,dh.size,dh.actions,dh.driveLetter)
                        console.log("Success!");
                    }

                } else {
                    // Not a string
                    console.log(`"${url}" is not a string`);
                }
            });

        } catch (e) {
            // Not a valid JSON array
            console.log("onDisk error:", e);
        }

        //Clear the "onDisk" parameter once it is processed
        removeOnDiskParameter();

    } else {
        // Log "B" if the parameter is not present
        console.log("onDisk not present");
    }
}

// Call the function on page load or setup
//processOnDiskParameter();


function removeOnDiskParameter() {
    // Get the current URL
    const url = new URL(window.location.href);

    // Remove the 'onDisk' parameter
    url.searchParams.delete('onDisk');

    // Update the URL and reload the page
    window.location.href = url.toString();
}



//file:///C:/Users/Haavard/Documents/GitHub/TheHarvard.github.io/p/scan.html?fromDH=&?onDisk=[%22/p/scan.html%22,%22/c/index.html%22,%22/c/map.html%22]
// Call the function on page load or setup
processOnDiskParameter();
//removeOnDiskParameter();

setDH("test1","url1","1",[],"A")
setDH("test2","url2","2",[],"A")
setDH("test3","url3","3",[],"A")
setDH("test4","url4","4",[],"A")

//clearAllDH();
console.log("dynamicHeader.js called")
dynamicHeader_update();


// update dynamic header on window load, show and visibility change
window.onpageshow = function() {
    dynamicHeader_update();
}
window.onfocus = function() {
    dynamicHeader_update();
};
document.addEventListener("visibilitychange", function() {
        dynamicHeader_update();
});


console.log("dynamicHeader.js complete")
