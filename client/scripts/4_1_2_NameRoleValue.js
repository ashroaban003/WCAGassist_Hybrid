setTimeout(() => {
    NameRoleValue();
}, 34000);

function NameRoleValue() {
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
    
    var userElements = document.querySelectorAll('button, fieldset, input, select, textarea, a, [role*="button"], img');
    for (var d = 0; d < userElements.length; d++) {
        let nodeName = userElements[d].nodeName.toLowerCase();
        let role = userElements[d].getAttribute('role') || nodeName;
        let hasName = false;

        if (userElements[d].getAttribute('title') !== null && userElements[d].getAttribute('title').trim() !== '') {
            hasName = true;
        } else if (userElements[d].labels && userElements[d].labels.length > 0) {
            hasName = true;
        } else if ((userElements[d].hasAttribute('aria-label') && (userElements[d].getAttribute('aria-label') !== null && userElements[d].getAttribute('aria-label').trim() !== ''))) {
            hasName = true;
        } else if (userElements[d].textContent.trim() !== '') {
            hasName = true;
        }

        if (!hasName) {
            ++errors;
            // window.alllogs.push("WCAG 4.1.2 (2.0,A)");
            postLogToBackend("WCAG 4.1.2 (2.0,A)")
            window.warningMessage("WCAG 4.1.2 (2.0,A)", "Found element without name. Provide name using aria-label or visible-text.", "Provide a descriptive label", userElements[d]);
            logMessage('Warning', "WCAG 4.1.2 (2.0,A)", "Found element without name. Provide name using aria-label or visible-text.", "Provide a descriptive label", userElements[d]);
            // Fix
            userElements[d].setAttribute('aria-label', "provide descriptive label");
            ++fixed;
        }
    }

    var linkElements = document.querySelectorAll('a:not([role="button"])');
    if (linkElements.length > 0) {
        for (var d = 0; d < linkElements.length; d++) {
            let hasHref = false;
            if (linkElements[d].hasAttribute('href') && linkElements[d].getAttribute('href') !== "") {
                hasHref = true;
            }

            if (!hasHref) {
                if (linkElements[d].textContent.trim() === '') 
                {
                    ++errors;
                    postLogToBackend("WCAG 4.1.2 (2.0,A)")
                    window.errorMessage("WCAG 4.1.2 (2.0,A)", "Link has no href attribute, Add href attribute", linkElements[d]);
                    logMessage('Error', "WCAG 4.1.2 (2.0,A)", "Link has no href attribute, Add href attribute", linkElements[d])
                    // Fix add "#" as href value
                    linkElements[d].setAttribute('href', '#');
                    ++fixed;
                } 
                else {
                //it has some content, so it might be a placeholder ? (maybe), so give a warning message 
                    postLogToBackend("WCAG 4.1.2 (2.0,A)")
                    window.warningMessage("WCAG 4.1.3 (2.0,A)", "Link has content, but no href attribute.", "Add href attribute or indicate it's placeholder", linkElements[d]);
                    logMessage('Warning', "WCAG 4.1.3 (2.0,A)", "Link has content, but no href attribute.", "Add href attribute or indicate it's placeholder", linkElements[d])
                }
            }
        }
    } 

    chrome.runtime.sendMessage({ type: "results", script: "4_1_2_NameRoleValue", data: { errors, fixed } });    
}