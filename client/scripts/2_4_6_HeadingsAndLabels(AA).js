setTimeout(() => {
    HeadingsAndLabels();
}, 13000);

function HeadingsAndLabels() {
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

    

    var headerList = [];
    $('*').each(function () {
        if ($(this).prop("nodeName").match(/^H[1-6]$/)) {
            headerList.push($(this));
        }
    });

    // defined currentHeader and nextHeader
    for (let index = 0; index < headerList.length - 1; index++) {
        let currentHeader = headerList[index];
        let nextHeader = headerList[index + 1];

        let currentLevel = parseInt(currentHeader.prop("nodeName").replace("H", ""));
        let nextLevel = parseInt(nextHeader.prop("nodeName").replace("H", ""));
        let expectedNextLevel = currentLevel + 1;

        if (nextLevel > expectedNextLevel) {
            errors++;
            window.errorMessage("WCAG 2.4.6 (2.0,AA)", "Header nesting is incorrect", "Modify the header nesting so that H" + expectedNextLevel + " follows the current " + currentHeader.prop("nodeName") + " tag", currentHeader);

            // Fix: Modify the header nesting
            nextHeader.replaceWith("<" + "H" + expectedNextLevel + ">" + nextHeader.html() + "</" + "H" + expectedNextLevel + ">");
            fixed++;
        }
    }   

    chrome.runtime.sendMessage({ type: "results", script: "2_4_6_HeadingsAndLabels(AA)", data: { errors, fixed } });
}
