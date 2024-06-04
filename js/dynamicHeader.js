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
function setDH(name, URL, size, actions) {
    var dhList = getDHList();
    var found = false;
    for (var i = 0; i < dhList.length; i++) {
        if (dhList[i].name === name) {
            dhList[i].URL = URL;
            dhList[i].size = size;
            dhList[i].actions = actions;
            found = true;
            break;
        }
    }
    if (!found) {
        dhList.push({ name: name, URL: URL, size: size, actions: actions, });
    }
    console.log("setDH actions", actions);
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


//==============================================================================



var currentPage_actions = "";

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
    //headerContent += "A:// M-DISK drive 1<br>";
    //headerContent += "B:// M-DISK drive 2<br>";
    //headerContent += "C:// Paralelle Delay-Line Memory<br>";

    // Add details and summary for each DH element to header content
    //console.log("starting...")
    dhList.forEach(function(dh) {
        // Check if name exceeds target width
        let truncatedName = dh.name.length > targetWidth - 10 ? dh.name.substring(0, targetWidth - 13) + "..." : dh.name;
        let nameSize = `├─${truncatedName} - ${dh.size} KB`;
        let paddingLength = targetWidth - nameSize.length;
        let padding = '-'.repeat(paddingLength);
        let summaryContent = `<summary>├─${truncatedName} ${padding} ${dh.size} KB</summary>`;
        let linkContent = `│ ├─<a href="${dh.URL}">[ Open ]</a><br>`;

        //add dh actions
            console.log(dh.name,dh.actions);
        if (Array.isArray(dh.actions)){
            console.log("IS AN ARRAY!");
            dh.actions.forEach(function(dhAction){

                linkContent +=`│ ├─<button onclick="${dhAction.script}">[ ${dhAction.name} ]</button><br>`;

            })
        }

        linkContent += `│ └─<button onclick="clearDH_buttonWithConfirm('${dh.name}')">[ Delete ]</button><br>`;
        headerContent += `<details>${summaryContent}${linkContent}</details>`;
        sumSize += parseInt(dh.size); // Update sum of size integers
        //console.log("name: ",dh.name," size: ",dh.size, " sumSize: ",sumSize)
    });
    //console.log("done! sumSize: ",sumSize)

    // Calculate padding for the last item
    let lastItemPadding = '-'.repeat(targetWidth - `├─ <Free> - ${totalSize-sumSize}KB/${totalSize}KB`.length);

    // Construct HTML string for the last item
    let lastItem = `└─ &lt;Free&gt; ${lastItemPadding} ${totalSize-sumSize}KB/${totalSize}KB<br>`;

    // Add last item to header content
    //headerContent += `│<br>`;
    headerContent += lastItem;

    //headerContent += "H:// Network Interface 1<br>";
    //headerContent += "N:// Network Interface 2<br>";

    headerContent += `Current Open File:<br>`;

    // Generate entry for current document
    let dh = {
        name: "",
        url: window.location.href,
        size: 0,
        actions:[]
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

    //check if there is enough memory available to store this file, otherwise
    //disable the save button on this refresh
    let saveButtonDisableAttribute  = "";
    let saveButtonText  = "Save";
    if (sumSize+parseInt(dh.size) > totalSize){
        saveButtonDisableAttribute  = "disabled";
        saveButtonText  = "Save: MEMORY ERROR";
    }

    let truncatedName = dh.name.length > targetWidth - 10 ? dh.name.substring(0, targetWidth - 13) + "..." : dh.name;
    let nameSize = `└─${truncatedName} - ${dh.size} KB`;
    let paddingLength = targetWidth - nameSize.length;
    let padding = '-'.repeat(paddingLength);
    let summaryContent = `<summary>└─${truncatedName} ${padding} ${dh.size} KB</summary>`;
    
    //console.log("button actions", dh.actions);
    //console.log("button JSON.stringify(dh.actions)", JSON.stringify(dh.actions));
    //currentPage_actions = JSON.stringify(dh.actions).replaceAll("\"","\'");
    currentPage_actions = dh.actions;
    //console.log("currentPage_actions", currentPage_actions);

    //let actionsContent = JSON.stringify(dh.actions).replaceAll("\"","\'");
    //let linkContent = `&nbsp; └─<button onclick="setDH('${dh.name}','${dh.url}','${dh.size}','`++`')' ${saveButtonDisableAttribute}>[ ${saveButtonText} ]</button><br>`;
    //let linkContent = `&nbsp; └─<button onclick="setDH('${dh.name}','${dh.url}','${dh.size}','${currentPage_actions}')" ${saveButtonDisableAttribute}>[ ${saveButtonText} ]</button><br>`;
    
    //Original: let linkContent = `&nbsp; └─<button onclick="setDH('${dh.name}','${dh.url}','${dh.size}')" ${saveButtonDisableAttribute}>[ ${saveButtonText} ]</button><br>`;
    let linkContent = `&nbsp; └─<button onclick="setDH('${dh.name}','${dh.url}','${dh.size}',currentPage_actions)" ${saveButtonDisableAttribute}>[ ${saveButtonText} ]</button><br>`;
    
    headerContent += `<details>${summaryContent}${linkContent}</details>`;

    //add seperating line
    headerContent += `================================================================================`;

    // Update dynamicHeader element with header content
    document.getElementById("dynamicHeader").innerHTML = headerContent;
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


//clearAllDH();
console.log("dynamicHeader.js called")
dynamicHeader_update();
console.log("dynamicHeader.js complete")