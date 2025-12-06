
// Head


//<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono&family=Noto+Color+Emoji&family=Noto+Emoji&family=Noto+Music&family=Noto+Sans+Math&family=Noto+Sans+SignWriting&family=Noto+Sans+Symbols&family=Noto+Sans+Symbols+2&display=swap" rel="stylesheet">
var style = document.createElement('link');
style.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Mono&family=Noto+Color+Emoji&family=Noto+Emoji&family=Noto+Music&family=Noto+Sans+Math&family=Noto+Sans+SignWriting&family=Noto+Sans+Symbols&family=Noto+Sans+Symbols+2&display=swap';
style.rel = 'stylesheet';
document.head.appendChild(style);

//<link href="../css/style.css" rel="stylesheet" type="text/css" />
//var style = document.createElement('link');
//style.href = '../css/style.css';
//style.rel = 'stylesheet';
//style.type = 'text/css';
//document.head.appendChild(style);

//<link id="colourwayCss" href="styleAmber.css" rel="stylesheet" type="text/css" />
var colourwayCss = document.createElement('link');
colourwayCss.id = 'colourwayCss';
//colourwayCss.href = '../css/colourwayAmber.css';
colourwayCss.href = '../css/style.css';
colourwayCss.rel = 'stylesheet';
colourwayCss.type = 'text/css';
document.head.appendChild(colourwayCss);

window.addEventListener('load', () => {

    // body
    // move html body to be inside <div id="content" style="display: none;">
    const bodyDiv = document.createElement('div');
    bodyDiv.id = 'content'; // Set the ID of the <div>
    bodyDiv.style.display = 'none'; // Set the inline style

    // Move each child node of document.body to bodyDiv
    while (document.body.firstChild) {
        bodyDiv.appendChild(document.body.firstChild);
    }

    // Insert bodyDiv at the beginning of document.body
    document.body.insertAdjacentElement('afterbegin', bodyDiv);
    //let a = document.getElementById("content");

    //Insert <div id="display"></div>
    const displayDiv = document.createElement('div');
    displayDiv.id = 'display'; 
    document.body.insertAdjacentElement('afterbegin', displayDiv);

    //insert dynamicHeader (is not typed)
    const bodyHeader = document.createElement('details');
    bodyHeader.id = 'dynamicHeader'; 
    // Check if the 'fromDH' URL parameter is present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('fromDH')) {
        bodyHeader.open = true; // Set the 'open' attribute to make it open by default
    }
    document.body.insertAdjacentElement('afterbegin', bodyHeader);

    //setup event to remove init elements when everything is loaded.
    window.onload = function() {
        // Select all elements with the class "init"
        var elements = document.querySelectorAll('.init');

        // Loop through the NodeList and remove each element
        elements.forEach(function(element) {
            element.parentNode.removeChild(element);
        });
    };

/*
    // add scripts
    var script = document.createElement('script');
    //script.src = 'https://cdn.rawgit.com/konvajs/konva/4.0.0/konva.min.js';
    script.src = '../js/konva.js';
    document.head.appendChild(script);

    //QRious - library for generating qr codes
    var script = document.createElement('script');
    script.src = '../js/QRious.js';
    document.head.appendChild(script);

    //document pre processing

    var script = document.createElement('script');
    script.src = '../js/time.js';
    script.defer = true;
    document.head.appendChild(script);

    var script = document.createElement('script');
    script.src = '../js/programs.js';
    script.defer = true;
    document.head.appendChild(script);

    var script = document.createElement('script');
    script.src = '../js/conditionalFormatting.js';
    script.defer = true;
    document.head.appendChild(script);

    //document is done and will be written

    var script = document.createElement('script');
    script.src = '../js/typer.js';
    script.defer = true;
    document.head.appendChild(script);

    var script = document.createElement('script');
    script.src = '../js/dynamicHeader.js';
    script.defer = true;
    document.head.appendChild(script);

    var script = document.createElement('script');
    script.src = '../js/colourwaySelector.js';
    script.defer = true;
    document.head.appendChild(script);

    var script = document.createElement('script');
    script.src = '../js/orbitalSystemMap.js';
    script.defer = true;
    document.head.appendChild(script);
*/

//load scripts sequentially
function loadScript(src) {
    return new Promise((resolve, reject) => {
        var script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(src);
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        document.head.appendChild(script);
    });
}

async function loadScriptsSequentially() {
    try {
        await loadScript('../js/konva.js');
        await loadScript('../js/QRious.js');
        await loadScript('../js/time.js');
        await loadScript('../js/programs.js');
        await loadScript('../js/conditionalFormatting.js');
        await loadScript('../js/typer.js');
        await loadScript('../js/dynamicHeader.js');
        await loadScript('../js/colourwaySelector.js');
        await loadScript('../js/orbitalSystemMap.js');
        await loadScript('../js/travelling.js');
        console.log('All scripts loaded successfully');
    } catch (error) {
        console.error(error.message);
    }
}

loadScriptsSequentially();

});