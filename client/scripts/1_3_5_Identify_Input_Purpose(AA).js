setTimeout(() => {
    IdentifyInputPurpose()
}, 3000);

function IdentifyInputPurpose() {
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

    
    var inputTags = document.querySelectorAll('input')
    for (var a = 0; a < inputTags.length; a++) {
        if (inputTags[a].type != "hidden") {
            if (inputTags[a].autocomplete == undefined || inputTags[a].autocomplete == "") {
                errors++;
                postLogToBackend("WCAG 1.3.5 (2.1,AA)")
                window.errorMessage("WCAG 1.3.5 (2.1,AA)", "AutoComplete is missing in input tag", "Add autocomplete='INPUT PURPOSE'", inputTags[a]);

                inputTags[a].setAttribute('autocomplete', 'off'); // Set a default value if missing
                console.log("%cFix Applied: %cAdded autocomplete='off' attribute to input tag", window.ruleStyle, window.fixStyle);
                fixed += 1;
            }
        }

    }

    chrome.runtime.sendMessage({ type: "results", script: "1_3_5_Identify_Input_Purpose(AA)", data: { errors, fixed } });
}