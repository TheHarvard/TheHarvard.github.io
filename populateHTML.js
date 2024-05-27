
// Head
//<link href="style.css" rel="stylesheet" type="text/css" />
var style = document.createElement('link');
style.href = 'style.css';
style.rel = 'stylesheet';
style.type = 'text/css';
document.head.appendChild(style);

//<link id="colourwayCss" href="styleAmber.css" rel="stylesheet" type="text/css" />
var colourwayCss = document.createElement('link');
colourwayCss.id = 'colourwayCss';
colourwayCss.href = 'colourwayAmber.css';
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

    // add scripts
    var script = document.createElement('script');
    script.src = 'colourwaySelector.js';
    document.head.appendChild(script);

    var script = document.createElement('script');
    script.src = 'typer.js';
    document.head.appendChild(script);

    //remove all init elements
    window.onload = function() {
        // Select all elements with the class "init"
        var elements = document.querySelectorAll('.init');

        // Loop through the NodeList and remove each element
        elements.forEach(function(element) {
            element.parentNode.removeChild(element);
        });
    };
});