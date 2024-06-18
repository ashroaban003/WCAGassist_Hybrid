setTimeout(() => {
    Dragging();
}, 19000);

// the user can try to drag the element and see the console for the logs . I have added the logs for the drag events 

function Dragging() {
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



    var draggableElements = document.querySelectorAll('[draggable="true"]');
    
    for (var i = 0; i < draggableElements.length; i++) {
        var element = draggableElements[i];

        // Check if the element has drag events attached 
        // no need to all the tags to have drag events 
        // only the tags that are draggable should have drag events
        var hasDragEvents = element.ondragstart || element.ondrag || element.ondragend;

        if (!hasDragEvents) {
            errors++;
            window.errorMessage("WCAG 2.5.7 (2.2,AA)", "Other non-pointer options for this draggable element are missing", "Add drag events (dragstart, drag, dragend) to handle the draggable element", element);

            
            // Add drag events to handle the draggable element
            element.ondragstart = function(event) {
                // Prevent default behavior
                event.preventDefault();
                // Custom logic for drag start
                console.log("Drag Start: ", this);
                // Sample custom logic: Change element color on drag start
            // this.style.backgroundColor = 'lightblue';
            };

            element.ondrag = function(event) {
                // Prevent default behavior
                event.preventDefault();
                // Custom logic for drag
                console.log("Dragging: ", this);
                // Sample custom logic: Change element opacity on dragging
            //this.style.opacity = '0.5';
            };

            element.ondragend = function(event) {
                // Prevent default behavior
                event.preventDefault();
                // Custom logic for drag end
                console.log("Drag End: ", this);
                // Sample custom logic: Reset element styles on drag end
            //this.style.backgroundColor = '';
            //this.style.opacity = '1';
            };

            //this function baiscally remove the drag option from question 
            // Add other non-pointer options to draggable element
            element.oncontextmenu = function() { return false; }; // Disable context menu
            element.onfocus = function() { this.blur(); }; // Remove focus

            fixed++;
        }
    }

    chrome.runtime.sendMessage({ type: "results", script: "2_5_7_Dragging(AA)", data: { errors, fixed } });  
}
