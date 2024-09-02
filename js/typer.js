console.log("typer.js called");

//document.addEventListener("DOMContentLoaded", function() {
//    mainTypeWriter(document.getElementById("content"),document.getElementById("display"));
//});

//function mainTypeWriter(contentElement,displayElement) {
//function mainTypeWriter() {
    const contentElement = document.getElementById("content");
    const displayElement = document.getElementById("display");

    let htmlString = contentElement.innerHTML;
    let index = 0;
    let charactersPerRender_override = 0;
    let renderTime_override = 0;
    let charactersPerRender = 3; // Number of characters added in each render
    let renderTime = 15; // Speed in milliseconds
    let doneflag = false;
    let stopflag = false;
    let stopOnNextLoopflag = false;
    let singleScreenStopFlag = false;
    let scrollFlag = false;

    const typer_osm_event = new CustomEvent('typer_osm', {});


    function typeWriter() {
        let charactersToBeRendered = "";
        let charactersToBeAppended = "";
        let charactersToBePrepended = "<br>";
        stopflag = stopOnNextLoopflag;
        stopOnNextLoopflag = false;
        //set scroll flag the loop after singleScreenStopFlag is set
        scrollFlag = singleScreenStopFlag;

        if(!singleScreenStopFlag) { //Scroll checker pauses before document once before scrolling
            const contentHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const buffer = 2; // You can adjust this buffer as needed
            //console.log("Content: ", contentHeight, " View: ", viewportHeight);
        
            if (contentHeight > viewportHeight+buffer) {
                //console.log("overflow detected");
                singleScreenStopFlag = true;
                stopflag = true;
                //index-=(2*charactersPerRender)+12;
                index-=(charactersPerRender)+1;
                charactersToBePrepended = ' <span style=\"white-space: nowrap;\"><button class="blink" onclick="typeWriter()">[ continue ]</button></span>';
                charactersToBeAppended = ' <br><span style=\"white-space: nowrap;\"><button class="blink" onclick="typeWriter()">[ continue ]</button></span><br>';
            }
        }

        
        if (index < htmlString.length) {

            if (stopflag) {
            displayElement.innerHTML = charactersToBePrepended + htmlString.substring(0, index + charactersPerRender)  + '</a></details>' + charactersToBeAppended;
            } else {
                displayElement.innerHTML = charactersToBePrepended + htmlString.substring(0, index + charactersPerRender) + '</a></details>' +'<span class="blink" style=\"white-space: nowrap;\">█</span>'+ charactersToBeAppended; // Add charactersToBeRendered to the display
            }

            //only scroll when scroll flag is set
            if (scrollFlag) {
                // Scroll to the bottom of the page
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'instant' // Optional: Smooth scrolling animation
                });
            }

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

                    else if (tagString.startsWith("<type-osm")) {
                        //skip rendering osm tags (orbitSystemMap)
                        let closingIndex = htmlString.indexOf("</type-osm", index + i);
                        console.log("skipped osm at:", index + i,closingIndex);
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
                            charactersPerRender = 3;
                            renderTime = 15;

                        } else if (typeTagString.startsWith("<type-speed-fast")) {
                            charactersPerRender = 10;
                            renderTime = 15;

                        } else if (typeTagString.startsWith("<type-speed-vfast")) {
                            charactersPerRender = 81;
                            renderTime = 15;

                        } else if (typeTagString.startsWith("<type-speed-slow")) {
                            charactersPerRender = 1;
                            renderTime = 40;

                        } else if (typeTagString.startsWith("<type-speed-vslow")) {
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
                        } else if (typeTagString.startsWith("<type-stop")) {
                            stopflag = true;
                            console.log("<type-stop>:", index + i);
                            
                            // on of osm, complete osm, pause typer, and call up osm renderer
                        } else if (typeTagString.startsWith("<type-osm")) {
                            //stopOnNextLoopflag = true;
                            //console.log('<type-osm>: ', index + i);
                            //document.dispatchEvent(typer_osm_event);

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
            

            
            if (stopflag==false) {
                if (renderTime_override < 1) {
                    setTimeout(typeWriter, renderTime); // Adjust the speed 
                } else {
                    setTimeout(typeWriter, renderTime_override); // Adjust the speed 
                }
            } else {
                console.log("Typer.js Paused");
            }


        } else {
            displayElement.innerHTML = "<br>"+htmlString.substring(0, index)

            //fire the completion event "typer_done".
            //const eventTarget = new EventTarget();
            const completionEvent = new CustomEvent('typer_done', {});
            document.dispatchEvent(completionEvent);
            
            //// switch back to content to include fancy renders.
            //contentElement.style.display = 'block'; // Set the inline style
            //displayElement.style.display = 'none'; // Set the inline style
            //
            //// Scroll to the bottom of the page
            //window.scrollTo({
            //    top: document.body.scrollHeight,
            //    behavior: 'instant' // Optional: Smooth scrolling animation
            //});


            console.log("typer.js done"); // Print "Done" when rendering is complete
        }
    }

    typeWriter();
//};



