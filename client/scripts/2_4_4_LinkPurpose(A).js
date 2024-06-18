setTimeout(() => {
    LinkPurpose()
}, 12000);

function LinkPurpose() {
    let errors = 0;
    let fixed = 0;
    $.fn.log = function () {
        console.log.apply(console, this);
        return this;
    };

    function postLogToBackend(logEntry) {
        logEntry = {rule: logEntry}
        fetch('http://localhost:4000/api/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logEntry)
        }).then(response => {
            if (response.ok) {
                console.log("Log entry posted successfully.");
            } else {
                console.error("Failed to post log entry.");
            }
        }).catch(error => {
            console.error("Error posting log entry:", error);
        });
    }

    function getText(element, maxLines = 20) {
        if(element == null)return "...";
        const textContent = element.innerHTML.trim();
        const lines = textContent.split('\n'); // split the text into lines
        return lines.slice(0, maxLines).join('\n'); // we'll take the first 20 lines
      }

    // Capture and store console messages
    function logMessage(type, rule, message, fixMessage, element) {
        chrome.storage.local.get('consoleLogs', function(result) {
            let logs = result.consoleLogs || [];
            logs.push({ type, rule, message, fixMessage, element: getText(element) });
            chrome.storage.local.set({ consoleLogs: logs });
        });
    }

    
    var anchorTags = document.querySelectorAll('a')
    for (var d = 0; d < anchorTags.length; d++) {
        if (anchorTags[d].innerText != null && anchorTags[d].innerText != "") {
            postLogToBackend("WCAG 2.4.4 (2.0,A)")
            window.warningMessage("WCAG 2.4.4 (2.0,A)", "Text in the anchor element might not be meaningful", "Provide meaningful text inside the anchor element", anchorTags[d]);
            
        }
        if (anchorTags[d].href != null && anchorTags[d].href != "") {
            if (anchorTags[d].innerText == null || anchorTags[d].innerText == "") {
                // errors++;
                // window.errorMessage("WCAG 2.4.4 (2.0,A)", "The anchor element with defined href is missing inner text which should describe the link", "Inner text has to be added. If an image is being enclosed in the anchor then you can instead add alt text to the inner image", anchorTags[d]);

                // // Fix: Add inner text only if the anchor does not contain non-textual content
                // if (!containsNonTextualContent(anchorTags[d])) {
                //     anchorTags[d].innerText = "Link";
                //     fixed++;
                // }

                if (anchorTags[d].childNodes.length === 1 && anchorTags[d].childNodes[0].nodeType === Node.TEXT_NODE) {
                    errors++;
                    postLogToBackend("WCAG 2.4.4 (2.0,A)")
                    window.errorMessage("WCAG 2.4.4 (2.0,A)", "The anchor element with defined href is missing inner text which should describe the link", "Inner text has to be added. If an image is being enclosed in the anchor then you can instead add alt text to the inner image", anchorTags[d]);
                    
                    // Fix: Add inner text
                    // anchorTags[d].innerText = "Link";
                    fixed++;
                }
                
            }
            if (anchorTags[d].innerText.toLowerCase() == "more" || anchorTags[d].innerText.toLowerCase() == "click here ") {
                // postLogToBackend("WCAG 2.4.4 (2.0,A)")
                window.warningMessage("WCAG 2.4.4 (2.0,A)", "Found suspicious link text in the anchor element", "Write clearer information in inside the anchor element and do not use suspicious texts like more, click here", anchorTags[d]);
                
            }
            if (anchorTags[d].getAttribute("aria-label") == null || anchorTags[d].getAttribute("aria-label") == "") {
                errors++;
                postLogToBackend("WCAG 2.4.4 (2.0,A)")
                window.errorMessage("WCAG 2.4.4 (2.0,A)", "The anchor element with defined href is missing Aria-label", "Aria-label has to be defined", anchorTags[d]);

                // Fix: Add aria-label attribute
                anchorTags[d].setAttribute('aria-label', 'Link');
                fixed++;
                
            }
            else if (anchorTags[d].title == null || anchorTags[d].title == "") {
                errors++;
                postLogToBackend("WCAG 2.4.4 (2.0,A)")
                window.errorMessage("WCAG 2.4.4 (2.0,A)", "The anchor element with defined href is missing title", "Title has to be added which clarifies the purpose of the link", anchorTags[d]);

                // Fix: Add title attribute
                anchorTags[d].setAttribute('title', ' ');
                fixed++;
                
            }

            var areaTags = document.querySelectorAll("area")
            for (let index = 0; index < areaTags.length; index++) {
                if (areaTags[index].parentNode.nodeName == "MAP") {
                    var imgParentTags = document.querySelectorAll('img')
                    for (let iter = 0; iter < imgParentTags.length; iter++) {
                        var useMapName = "#" + areaTags[index].parentNode.name
                        if (useMapName == imgParentTags[iter].useMap) {
                            if (areaTags[index].alt == null || areaTags.alt == "") {
                                errors++;
                                postLogToBackend("WCAG 2.4.4 (2.0,A)")
                                window.errorMessage("WCAG 2.4.4 (2.0,A)", "Alt text for the client-side <area> element of an image map is missing alt text", "Specify a short text alternative with the alt attribute for every client-side <area> element of an image map", areaTags[index]);

                                // Fix: Add alt attribute
                                areaTags[index].setAttribute('alt', ' ');
                                fixed++;
                                
                            }
                        }
                    }
                }
            }
        }
    }

    chrome.runtime.sendMessage({ type: "results", script: "2_4_4_LinkPurpose(A)", data: { errors, fixed } });    
}

function containsNonTextualContent(element) {
    
    var children = element.childNodes;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType === 1 && children[i].nodeName !== "IMG" && children[i].nodeName !== "EMBED" && children[i].nodeName !== "OBJECT" && children[i].nodeName !== "VIDEO") {
            return false;
        }
    }
    return true; 
}