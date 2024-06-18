setTimeout(() => {
    Pause_Stop_Hide();
}, 11000);

function Pause_Stop_Hide() {

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

    
    var marqueeTags = document.querySelectorAll('marquee');
    for (var d = 0; d < marqueeTags.length; d++) {
        errors++;
        window.errorMessage("WCAG 2.2.2 (2.0,A)", "Marquee tag found in the html page", "Provide users enough time to read and use content. Use strong or em tag instead of marquee.", marqueeTags[d]);

        // Replace marquee tag with strong or em tag
        // var parentElement = marqueeTags[d].parentNode;
        // var textContent = marqueeTags[d].textContent;
        // var replacementTag = document.createElement('strong'); // or 'em' depending on the semantics
        // replacementTag.textContent = textContent;
        // parentElement.replaceChild(replacementTag, marqueeTags[d]);

        var newTag = document.createElement("strong");
        newTag.innerHTML = marqueeTags[d].innerHTML;
        marqueeTags[d].replaceWith(newTag);

        fixed++;
    }

    chrome.runtime.sendMessage({ type: "results", script: "2_2_2_Pause,Stop,Hide(A)", data: { errors, fixed } });    
}
