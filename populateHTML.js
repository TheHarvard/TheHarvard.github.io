function loadHTML(url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            callback(data);
        })
        .catch(error => console.error('Error loading HTML:', error));
}


// Load and insert header
loadHTML('_header.html', function(data) {
    document.head.insertAdjacentHTML('beforeend', data);
});


//<link href="style.css" rel="stylesheet" type="text/css" />
var style = document.createElement('link');
style.href = 'style.css';
style.rel = 'stylesheet';
style.type = 'text/css';
document.head.appendChild(style);

//<link id="colourwayCss" href="styleAmber.css" rel="stylesheet" type="text/css" />
var colourwayCss = document.createElement('link');
colourwayCss.id = 'colourwayCss';
colourwayCss.href = 'styleAmber.css';
colourwayCss.rel = 'stylesheet';
colourwayCss.type = 'text/css';
document.head.appendChild(colourwayCss);

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

// Load and insert body header
//loadHTML('_bodyHeader.html', function(data) {
//    document.body.insertAdjacentHTML('afterbegin', data);
//});
    
//mainTypeWriter(document.getElementById("content"),document.getElementById("display"));
    
// add scripts
var script = document.createElement('script');
script.src = 'colourwaySelector.js';
document.head.appendChild(script);

var script = document.createElement('script');
script.src = 'typer.js';
document.head.appendChild(script);
