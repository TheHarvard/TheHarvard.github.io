document.addEventListener("DOMContentLoaded", function() {
    const contentElement = document.getElementById("content");
    const displayElement = document.getElementById("display");

    let htmlString = contentElement.innerHTML;
    let index = 0;
    let charactersPerRender_override = 0;
    let renderTime_override = 0;
    let charactersPerRender = 3; // Number of characters added in each render
    let renderTime = 4; // Speed in milliseconds
    let doneflag = false;

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
            while (i < charactersToBeRendered.length && doneflag == false) {
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
                            //console.log("Skipped:", closingIndex - index, "characters.");
                            index = closingIndex;
                            break; // Exit the loop after finding the closing tag
                        }
                    }
                    else if (tagString.startsWith("<!--")) {
                        //skip rendering comments
                        let closingIndex = htmlString.indexOf("-->", index + i);
                        console.log("skipped comment at:", index + i,closingIndex);
                        index = closingIndex;
                        if (renderTime_override < 4) {
                            renderTime_override = 4;
                        }
                    }
                    else if (tagString.startsWith("<type-")||tagString.startsWith("</type-")) {
                        let closingIndex = htmlString.indexOf(">", index + i);
                        const typeTagString = htmlString.substring(index + i,closingIndex);
                        //console.log(typeTagString, "at index:", index, "-", closingIndex);


                        if (typeTagString.startsWith("<type-sleep")) {
                            // delay for one character, then resume standard speed
                            charactersPerRender_override = 1;
                            renderTime_override = 1000;
                            console.log("sleept at index:", index, "-", closingIndex);

                        } else if (typeTagString.startsWith("<type-speed-norm")) {
                            // set the speed going forward - WIP
                            charactersPerRender = 6;
                            renderTime = 5;

                        } else if (typeTagString.startsWith("<type-speed-fast")) {
                            // set the speed going forward - WIP
                            charactersPerRender = 10;
                            renderTime = 5;

                        } else if (typeTagString.startsWith("<type-speed-vfast")) {
                            // set the speed going forward - WIP
                            charactersPerRender = 160;
                            renderTime = 5;

                        } else if (typeTagString.startsWith("<type-speed-slow")) {
                            // set the speed going forward - WIP
                            charactersPerRender = 1;
                            renderTime = 40;

                        } else if (typeTagString.startsWith("<type-speed-vslow")) {
                            // set the speed going forward - WIP
                            charactersPerRender = 1;
                            renderTime = 200;

                        } else if (typeTagString.startsWith("</type-forget")) {
                            // add comment after tag close is hit
                            let openingIndex = htmlString.lastIndexOf("<type-forget", index + i);
                            //console.log("<type-forget>:", closingIndex,"</type-forget:", index + i);
                            htmlString = htmlString.substring(0, index + i) + "-->" + htmlString.substring(index + i);
                            htmlString = htmlString.substring(0, openingIndex) + "<!--" + htmlString.substring(openingIndex+13);
                        
                            // skip the render of the rest of the document, skip to finished - WIP
                        } else if (typeTagString.startsWith("<type-done")) {
                            doneflag = true;

                            // restarts the douement render - WIP
                        } else if (typeTagString.startsWith("<type-loop")) {
                            index = 0
                        
                            // pause rendering until something happens - WIP
                        } else if (typeTagString.startsWith("<type-wait")) {
                        //console.log("<type-wait", index + i);

                    }
                        //skip lenght of tag
                        //console.log("skipped tag:", htmlString.substring(index + i,closingIndex));
                        index = closingIndex;
                        if (renderTime_override < 4) {
                            renderTime_override = 4;
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
