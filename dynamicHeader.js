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


let cookieName = "dynamicHeader";
let cookieValue = getCookie(cookieName);

if (cookieValue) {
    let newValue = parseInt(cookieValue) + 1;
    setCookie(cookieName, newValue, 365); // Update cookie with new value
    document.getElementById("dynamicHeader").textContent = newValue;
} else {
    let initialValue = 1;
    setCookie(cookieName, initialValue, 365); // Set cookie for 1 year
    document.getElementById("dynamicHeader").textContent = initialValue;
}
