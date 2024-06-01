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
function setDH(name, URL, size) {
    var dhList = getDHList();
    var found = false;
    for (var i = 0; i < dhList.length; i++) {
        if (dhList[i].name === name) {
            dhList[i].URL = URL;
            dhList[i].size = size;
            found = true;
            break;
        }
    }
    if (!found) {
        dhList.push({ name: name, URL: URL, size: size });
    }
    DHsetCookie("DH_list", JSON.stringify(dhList), 365);
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
}

// Utility function to get DH list from cookie
function getDHList() {
    var dhListCookie = DHgetCookie("DH_list");
    return dhListCookie ? JSON.parse(dhListCookie) : [];
}





//==============================================================================


setDH("1", "WWW.Something.com", 2222)
setDH("2", "WWW.Something.com", 2)
setDH("3", "WWW.Something.com", 2)

// Set up header
{
    let cookieName = "dynamicHeader";
    let cookieValue = DHgetCookie(cookieName);

    let headerContent = ''; // Initialize header content

    if (cookieValue) {
        let newValue = parseInt(cookieValue) + 1;
        DHsetCookie(cookieName, newValue, 365); // Update cookie with new value
        headerContent += newValue + '<br>'; // Add incrementing number to header content
    } else {
        let initialValue = 1;
        DHsetCookie(cookieName, initialValue, 365); // Set cookie for 1 year
        headerContent += initialValue + '<br>'; // Add initial value to header content
    }

    // Retrieve DH list
    let dhList = getDHList();

 // Add each formatted DH element to header content
 dhList.forEach(function(dh) {
    let nameLength = dh.name.length;
    let sizeLength = dh.size.toString().length;
    let targetLength = 30; // Adjust this value as needed
    let dashes = '-'.repeat(targetLength - nameLength - sizeLength - 3); // Calculate number of dashes

    headerContent += `${dh.name} ${dashes} ${dh.size} KB<br>`; // Add formatted DH to header content
});

headerContent += `================================================================================`;


    // Update dynamicHeader element with header content
    document.getElementById("dynamicHeader").innerHTML = headerContent;
}