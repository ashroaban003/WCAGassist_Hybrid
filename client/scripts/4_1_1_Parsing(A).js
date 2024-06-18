setTimeout(() => {
    Parsing()   
}, 32000);

function Parsing() {
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

    // // Override console methods
    // const originalLog = console.log;
    // const originalWarn = console.warn;

    // console.log = function(...args) {
    //     originalLog.apply(console, args);
    //     logMessage('log', 'General', args.join(' '), null, null);
    // };

    // console.warn = function(...args) {
    //     originalWarn.apply(console, args);
    //     logMessage('warn', 'General', args.join(' '), null, null);
    // };

    if (document.doctype === null) {
        errors++;
        const message = "Doctype is missing.";
        window.errorMessage("WCAG 4.1.1 (2.0,A)", message, "Add <!DOCTYPE html>", document.documentElement);
        logMessage('Error', "WCAG 4.1.1 (2.0,A)", message, "Add <!DOCTYPE html>", document.documentElement);

        // Fix: Add <!DOCTYPE html>
        const doctype = document.implementation.createDocumentType('html', '', '');
        document.insertBefore(doctype, document.childNodes[0]);
        fixed++;
    }

    const allTags = document.querySelectorAll('*');
    const id_map = {};

    for (let d = 0; d < allTags.length; d++) {
        const tagName = allTags[d].nodeName;
        if (!["HTML", "BASE", "TITLE", "SCRIPT", "STYLE", "HEAD", "META"].includes(tagName)) {
            const id = allTags[d].id;
            if (id) {
                if (id_map[id]) {
                    id_map[id].push(d);
                } else {
                    id_map[id] = [d];
                }
            }
        }
    }

    for (const id in id_map) {
        if (id_map[id].length > 1) {
            errors++;
            const message = "Found two or more elements using the same id";
            window.errorMessage("WCAG 4.1.1 (2.0,A)", message, "Use a distinct id value", allTags[id_map[id][0]]);
            logMessage('error', "WCAG 4.1.1 (2.0,A)", message, "Use a distinct id value", allTags[id_map[id][0]]);
            // Fixing it alters the structure of the website, so leave it to the developer
        }
    }

    chrome.runtime.sendMessage({ type: "results", script: "4_1_1_Parsing(A)", data: { errors, fixed } });  
}
