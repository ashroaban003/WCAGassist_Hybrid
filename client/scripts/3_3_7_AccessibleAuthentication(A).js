setTimeout(() => {
    AccessibleAuthentication()
}, 30000);
function AutoComplete(elementArray) {
    for (var i = 0; i < elementArray.length; i++) {
        if (elementArray[i].type == "submit" || elementArray[i].type == "hidden") {
            continue
        } else {
            if (elementArray[i].autocomplete == "off" || elementArray[i].autocomplete == "" || elementArray[i].autocomplete == null) {
                return false
            }
        }
    }
    return true
}
function AccessibleAuthentication() {
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
        if(!inputTags[a].disabled){
            if (inputTags[a].type == "submit") {
                if (inputTags[a].form == null) {
                    if (element.oncontextmenu == null && element.onfocus == null) {
                        errors++;
                        window.errorMessage("WCAG 3.3.7 (2.2,A)", "Misplaced submit button", "Submit button must be enclosed inside a form", inputTags[a]);
                        logMessage('Error',"WCAG 3.3.7 (2.2,A)", "Misplaced submit button", "Submit button must be enclosed inside a form", inputTags[a]);
                        
                        // Fix: Enclose submit button inside a form
                        var newForm = document.createElement("form");
                        inputTags[a].parentNode.insertBefore(newForm, inputTags[a]);
                        newForm.appendChild(inputTags[a]);

                        fixed++;

                        
                    }
                }
                var formLength = inputTags[a].form.length
                if (formLength > 0) {
                    var submitExists = false
                    var formArray = inputTags[a].form
                    // window.errorMessage("007this is form array: ", formArray)
                    for (var k = 0; k < formArray.length; k++) {
                        if (formArray[k].type == "submit") {
                            submitExists = true
                            break
                        }
                    }
                    if (submitExists) {
                        if (AutoComplete(formArray)) {
                        } else {
                            errors++;
                            window.errorMessage("WCAG 3.3.7 (2.2,A)", "Autocomplete for some form elements is missing/off", "Allow autocomplete feature for input elements in the form", inputTags[a]);
                            logMessage('Error',"WCAG 3.3.7 (2.2,A)", "Autocomplete for some form elements is missing/off", "Allow autocomplete feature for input elements in the form", inputTags[a]);

                            // Fix: Add autocomplete attribute
                            for (var i = 0; i < formArray.length; i++) {
                                if (formArray[i].type == "submit" || formArray[i].type == "hidden") {
                                    continue
                                } else {
                                    formArray[i].autocomplete = "on"
                                }
                            }
                            fixed++;
                            
                        }
                    }
                    else {
                        errors++;
                        window.errorMessage("WCAG 3.3.7 (2.2,A)", "Submit button does not exist", "Add submit button in the form to enable browser store a password", inputTags[a]);
                        logMessage('Error',"WCAG 3.3.7 (2.2,A)", "Submit button does not exist", "Add submit button in the form to enable browser store a password", inputTags[a]);
                        
                        // Fix: Add submit button
                        var newSubmit = document.createElement("input");
                        newSubmit.type = "submit";
                        inputTags[a].form.appendChild(newSubmit);
                        fixed++;

                        
                    }
                } else {
                    if (inputTags[a].autocomplete == "") {
                        errors++;
                        window.errorMessage("WCAG 3.3.7 (2.2,A)", "Autocomplete for the form is missing", "Allow autocomplete feature for input elements in the form", inputTags[a]);
                        logMessage('Error',"WCAG 3.3.7 (2.2,A)", "Autocomplete for the form is missing", "Allow autocomplete feature for input elements in the form", inputTags[a]);

                        // Fix: Add autocomplete attribute
                        inputTags[a].autocomplete = "on"
                        fixed++;

                        
                    } else {
                        if (inputTags[a].autocomplete == "off") {
                            errors++;
                            window.errorMessage("WCAG 3.3.7 (2.2,A)", "Autocomplete for the form is off", "Allow autocomplete feature for input elements in the form", inputTags[a]);
                            logMessage('Error',"WCAG 3.3.7 (2.2,A)", "Autocomplete for the form is off", "Allow autocomplete feature for input elements in the form", inputTags[a]);

                            // Fix: Add autocomplete attribute
                            inputTags[a].autocomplete = "on"

                            fixed++;
                            
                            
                        }
                    }
                }
    
            }
        }
        
    }
    chrome.runtime.sendMessage({ type: "results", script: "3_3_7_AccessibleAuthentication(A)", data: { errors, fixed } });  
}