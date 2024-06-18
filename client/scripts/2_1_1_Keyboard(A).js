setTimeout(() => {
    Keyboard()
}, 10000);

function Keyboard() {

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

    
    var allTags = document.querySelectorAll('*')
    for (var d = 0; d < allTags.length; d++) {
        if (allTags[d].getAttribute("onmouseout") != null && allTags[d].getAttribute("onmouseout") != undefined && allTags[d].getAttribute("onmouseout") != "") {

            if (allTags[d].getAttribute("onblur") == null || allTags[d].getAttribute("onblur") == undefined) {
                errors++;
                window.errorMessage("WCAG 2.1.1 (2.0,A)", "Element is keyboard inaccessible. Element's onmouseout is missing onblur function", "Element's onblur function has to be added and it should functionally work the same way as onmouseout handler", allTags[d]);

                // Fix: Add onblur function
                allTags[d].setAttribute("onblur", allTags[d].getAttribute("onmouseout"));
                fixed++;
                
            } else if (allTags[d].getAttribute("onblur") == "") {
                errors++;
                window.errorMessage("WCAG 2.1.1 (2.0,A)", "Element is keyboard inaccessible. Element's onmouseout with undefined onblur function", "Element's onblur function has to be defined and it should functionally work the same way as onmouseout handler", allTags[d]);

                // Fix: Add onblur function
                allTags[d].setAttribute("onblur", allTags[d].getAttribute("onmouseout"));
                fixed++;

            }
        }
        if (allTags[d].getAttribute("onmouseover") != null && allTags[d].getAttribute("onmouseover") != undefined && allTags[d].getAttribute("onmouseover") != "") {
            if (allTags[d].getAttribute("onfocus") == null || allTags[d].getAttribute("onfocus") == undefined) {
                errors++;
                window.errorMessage("WCAG 2.1.1 (2.0,A)", "Element is keyboard inaccessible. Element has onmouseover defined but onfocus function is missing", "Element's onfocus function has to be added and it should functionally work the same way as onmouseover handler", allTags[d]);

                // Fix: Add onfocus function
                allTags[d].setAttribute("onfocus", allTags[d].getAttribute("onmouseover"));
                fixed++;
                
            } else if (allTags[d].getAttribute("onfocus") == "") {
                errors++;
                window.errorMessage("WCAG 2.1.1 (2.0,A)", "Element is keyboard inaccessible. Element has onmouseover defined but onfocus function is empty", "Element's onfocus function has to be defined and it should functionally work the same way as onmouseover handler", allTags[d]);

                // Fix: Add onfocus function
                allTags[d].setAttribute("onfocus", allTags[d].getAttribute("onmouseover"));
                fixed++;
                
            }
        }
        if (allTags[d].nodeName == "SCRIPT") {
                window.warningMessage("WCAG 2.1.1 (2.0,A)", "The script element might be keyboard accessible", "Try to make sure if script element is accessible via keyboard or avoid using script element.", allTags[d]);
        }
    }

    chrome.runtime.sendMessage({ type: "results", script: "2_1_1_Keyboard(A)", data: { errors, fixed } });

}
