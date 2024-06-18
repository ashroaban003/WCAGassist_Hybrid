// Ensure the label text is included in the accessible name
function ensureLabelInName() {
    let errors = 0;
    let fixed = 0;

    function getText(element, maxLines = 20) {
        if(element == null)return "...";
        const textContent = element.innerHTML.trim();
        const lines = textContent.split('\n'); // split the text into lines
        return lines.slice(0, maxLines).join('\n'); // we'll take the first 20 lines
      }

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

    // Capture and store console messages
    function logMessage(type, rule, message, fixMessage, element) {
        chrome.storage.local.get('consoleLogs', function(result) {
            let logs = result.consoleLogs || [];
            logs.push({ type, rule, message, fixMessage, element: getText(element) });
            chrome.storage.local.set({ consoleLogs: logs });
        });
    }

    
    var allComponents = document.querySelectorAll("[aria-labelledby]");
    for (var i = 0; i < allComponents.length; i++) {
        var component = allComponents[i];
        var labelIds = component.getAttribute("aria-labelledby").split(" ");
        var labelText = "";

        // Retrieve text from labels
        for (var j = 0; j < labelIds.length; j++) {
            var labelElement = document.getElementById(labelIds[j]);
            if (labelElement) {
                var textContent = labelElement.textContent.trim();
                if (textContent) {
                    labelText += textContent + " ";
                }
            }
        }

        // Checks
        if (labelText.trim() !== "") {
            var accessibleName = component.textContent.trim();
            if (!accessibleName.includes(labelText.trim())) {

                errors++;
            
                component.textContent = labelText + accessibleName;
                window.errorMessage("WCAG 2.5.3 (A)", "Ensure label text is included in the accessible name", "Updated the accessible name", component);

                fixed++;
            }
        }
    }

    chrome.runtime.sendMessage({ type: "results", script: "2_5_3_LabelName(A)", data: { errors, fixed } });  
}

// Call the function after a timeout
setTimeout(ensureLabelInName, 17000);
