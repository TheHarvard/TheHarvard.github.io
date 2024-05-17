document.addEventListener("DOMContentLoaded", function() {
    const contentElement = document.getElementById("content");
    const displayElement = document.getElementById("display");

    const htmlString = contentElement.innerHTML;
    let index = 0;
    let charactersPerRender_override = 0;
    let renderTime_override = 0;
    const charactersPerRender = 3; // Number of characters added in each render
    const renderTime = 4; // Speed in milliseconds

    function typeWriter() {
        let charactersToBeRendered = "";
        if (index < htmlString.length) {
            displayElement.innerHTML = htmlString.substring(0, index + charactersPerRender) 
            + "<span style=\"white-space: nowrap;color:#ffb000\">█</span>"; // Add charactersToBeRendered to the display

            // Scroll to the bottom of the page
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'instant' // Optional: Smooth scrolling animation
            });

            charactersToBeRendered = htmlString.substring(index, index + charactersPerRender);

            charactersPerRender_override = 0;
            renderTime_override = 0;
            let i = 0;
            while (i < charactersToBeRendered.length) {
                const char = charactersToBeRendered[i];
                if (char === '<') {
                    // Found the start of an HTML tag
                    const tagString = htmlString.substring(index + i, index + i + 9);
                    //console.log("tagString:", tagString);
                    if (tagString === "<details>") {
                        //it is a details tag

                        // Look for the closing </details> tag after the opening <details> tag
                        let closingIndex = htmlString.indexOf("</details>", index + i);
                        if (closingIndex !== -1) {
                            console.log("Skipped:", closingIndex - index, "characters.");
                            index = closingIndex;
                            break; // Exit the loop after finding the closing tag
                        }
                    }
                    else if (tagString.startsWith("<type_")) {
                        let closingIndex = htmlString.indexOf(">", index + i);
                        const typeTagString = htmlString.substring(index + i,closingIndex);
                        index = closingIndex;
                        console.log(typeTagString, "at index:", index);

                        if (typeTagString.startsWith("<type_sleep")) {
                            charactersPerRender_override = 1;
                            renderTime_override = 300;
                        }
                    }
                }
                i++;
            }

            if (charactersPerRender_override < 1) {
                index += charactersPerRender; // Increment index by charactersPerRender
            } else {
                index += charactersPerRender_override; // Increment index by charactersPerRender_override
            }

            
            if (renderTime_override < 1) {
                setTimeout(typeWriter, renderTime); // Adjust the speed 
            } else {
                setTimeout(typeWriter, renderTime_override); // Adjust the speed 
            }

        } else {
            displayElement.innerHTML = htmlString.substring(0, index)
            console.log("Done"); // Print "Done" when rendering is complete
        }
    }

    typeWriter();
});
