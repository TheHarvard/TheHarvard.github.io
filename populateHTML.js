function loadHTML(url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            callback(data);
        })
        .catch(error => console.error('Error loading HTML:', error));
}

window.addEventListener('DOMContentLoaded', () => {

    // Load and insert header
    loadHTML('_header.html', function(data) {
        document.head.insertAdjacentHTML('beforeend', data);
    });


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



    // Load and insert body header
    loadHTML('_bodyHeader.html', function(data) {
        document.body.insertAdjacentHTML('afterbegin', data);
    });
    let a = document.getElementById("content");
        
    //mainTypeWriter(document.getElementById("content"),document.getElementById("display"));
    

});