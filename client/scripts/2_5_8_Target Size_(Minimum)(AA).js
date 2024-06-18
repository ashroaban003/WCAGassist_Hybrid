setTimeout(() => {
  PointerTargetSpacing();
}, 20000);


// fix the code to make the target size at least 24 pixels 
function PointerTargetSpacing() {
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

    function getText(element, maxLines = 10) {
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


  var allTags = document.querySelectorAll("*");
  for (var k = 0; k < allTags.length; k++) {
      if (
          allTags[k].nodeName !== "HTML" &&
          allTags[k].nodeName !== "BODY" &&
          allTags[k].nodeName !== "LINK" &&
          allTags[k].nodeName !== "SCRIPT" &&
          allTags[k].nodeName !== "STYLE" &&
          allTags[k].nodeName !== "XML" &&
          allTags[k].nodeName !== "HEAD" &&
          allTags[k].nodeName !== "META"
      ) {
          var targetWidth = allTags[k].clientWidth;
          var targetHeight = allTags[k].clientHeight;
          var targetIsInsideBoundary =
              targetWidth < 24 && targetHeight < 24;

          if (targetIsInsideBoundary) {
              // Resize the element if its size is less than 24x24 pixels
              if (targetWidth < 24) {
                  allTags[k].style.minWidth = "24px";
              }
              if (targetHeight < 24) {
                  allTags[k].style.minHeight = "24px";
              }

              errors++;

            window.errorMessage("WCAG 2.5.8 (2.2,AA)", "Need the target size to be at least 24 pixels", "Resized the element or enclosed it within a 24x24 boundary", allTags[k]);
            logMessage('Error',"WCAG 2.5.8 (2.2,AA)", "Need the target size to be at least 24 pixels", "Resized the element or enclosed it within a 24x24 boundary", allTags[k]);

            fixed++;
            

          }
      }
  }

  chrome.runtime.sendMessage({ type: "results", script: "2_5_8_Target Size_(Minimum)(AA)", data: { errors, fixed } });  
}
