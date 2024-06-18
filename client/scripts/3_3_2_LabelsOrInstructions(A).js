
setTimeout(() => {
    LabelsOrInstructions();
}, 28000);

function LabelsOrInstructions() {
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

    var inputTags = document.querySelectorAll('input');

    for (var d = 0; d < inputTags.length; d++) {
        var inputElement = inputTags[d];
        var label = document.querySelector('label[for="' + inputElement.id + '"]');

        if (label && (!label.innerText || label.innerText.trim() === '')) {
            errors++;
            window.errorMessage("WCAG 3.3.2 (2.0,A)", "Input element's corresponding label's text found empty", "Input element's corresponding label's text has to be added", inputElement);
            logMessage('Error',"WCAG 3.3.2 (2.0,A)", "Input element's corresponding label's text found empty", "Input element's corresponding label's text has to be added", inputElement);

            
            // Fix: Add text to the label
            label.innerText = "Label for " + inputElement.id;
            fixed++;
        }
    }
    chrome.runtime.sendMessage({ type: "results", script: "3_3_2_LabelsOrInstructions(A)", data: { errors, fixed } });  
}
