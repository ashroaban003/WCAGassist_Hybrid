// Check and enforce consistent help mechanisms order

setTimeout(() => {
    enforceConsistentHelpOrder();
  }, 24000);
  
  
function enforceConsistentHelpOrder() {
    let errors = 0;
    let fixed = 0;

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

    var helpMechanisms = document.querySelectorAll('.help-mechanism'); // Assuming each help mechanism has a class 'help-mechanism'
    var previousOrder = null;

    helpMechanisms.forEach(function(helpMechanism) {
        var currentOrder = getHelpMechanismOrder(helpMechanism);
        
        if (previousOrder !== null && currentOrder !== previousOrder) {
            errors++;
            window.errorMessage("WCAG 3.2.6 (A)", "Check and enforce consistent help mechanisms order", "Help mechanisms are not in a consistent order", helpMechanism);
            logMessage('Error',"WCAG 3.2.6 (A)", "Check and enforce consistent help mechanisms order", "Help mechanisms are not in a consistent order", helpMechanism);

        }
        
        previousOrder = currentOrder;
    });

    chrome.runtime.sendMessage({ type: "results", script: "3_2_6_ConsistentHelp(A)", data: { errors, fixed } });  
}


function getHelpMechanismOrder(helpMechanism) {
    var order = 0;
    var sibling = helpMechanism.previousElementSibling;

    while (sibling) {
        order++;
        sibling = sibling.previousElementSibling;
    }

    return order;
}


enforceConsistentHelpOrder();
