setTimeout(() => {
    InfoAndRelationships()
}, 2000);

function InfoAndRelationships() {
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

    

    function replaceElement(name, old){
        var newTag = document.createElement(name);
        newTag.innerHTML = old.innerHTML;
        old.replaceWith(newTag);
      }
      
    var inputTags = document.querySelectorAll('input')
    for (var d = 0; d < inputTags.length; d++) {
        if (!inputTags[d].disabled) {
            var testCasePass = false
            if (inputTags[d].type == "text") {
                var labelTags = document.querySelectorAll("label")
                for (var x = 0; x < labelTags.length; x++) {
                    if (labelTags[x].htmlFor == inputTags[d].id) {
                        if (labelTags[x].innerText != null && labelTags[x].innerText != "") {
                            testCasePass = true
                            break
                        }
                    }
                }
                if (testCasePass == false) {
                    errors++;
                    postLogToBackend("WCAG 1.3.1 (2.0,A)")
                    window.errorMessage("WCAG 1.3.1 (2.0,A)", "Input element (of type text) is missing text in the label", "A text to the label corresponding to this input element has to be added in order to describe the function or purpose of the control", inputTags[d]);

                    // Fix: Add text to the label
                    // var newLabelText = title_query(inputTags[d].innerText); 
                    // var newLabelText = inputTags[d].name || inputTags[d].placeholder || 'label'
                    // var newLabel = document.createElement("label");
                    // newLabel.setAttribute("for", inputTags[d].id);
                    // newLabel.innerText = newLabelText;
                    // inputTags[d].parentNode.insertBefore(newLabel, inputTags[d]);
                    fixed++;
                }

                if (inputTags[d].title == null || inputTags[d].title == "") {
                    errors++;
                    postLogToBackend("WCAG 1.3.1 (2.0,A)")
                    window.errorMessage("WCAG 1.3.1 (2.0,A)", "Input element (of type text) is missing a title", "A title has to be added to this input element in order to describe the function or purpose of the control", inputTags[d]);

                    // Fix: Add title attribute
                    var newTitleText = inputTags[d].name || inputTags[d].placeholder || 'Title'
                    // inputTags[d].setAttribute('title', title_query(inputTags[d].innerText));
                    inputTags[d].setAttribute('title', newTitleText);
                    fixed++;

                }

                var etestCasePass = false
                var e1labelTags = document.querySelectorAll("label")
                for (var x = 0; x < e1labelTags.length; x++) {
                    if (inputTags[d].contains(e1labelTags[x])) {
                        if (e1labelTags[x].innerText != null && e1labelTags[x].innerHTML != "") {
                            etestCasePass = true
                            break
                        }
                    }
                }
                if (etestCasePass == false) {
                    errors++;
                    postLogToBackend("WCAG 1.3.1 (2.0,A)")
                    window.errorMessage("WCAG 1.3.1 (2.0,A)", "Input element (of type text) is missing a label", "A label corresponding to this input element has to be added in order to describe the function or purpose of the control", inputTags[d]);

                    // Fix: Add label text
                    // var newLabelText = title_query(inputTags[d].innerText);
                    // var newLabelText = inputTags[d].name || inputTags[d].placeholder || 'label'
                    // var newLabel = document.createElement("label");
                    // newLabel.setAttribute("for", inputTags[d].id);
                    // newLabel.innerText = newLabelText;
                    // inputTags[d].parentNode.insertBefore(newLabel, inputTags[d]);

                    fixed++;

                }
            }
        }


    }
    $(document).ready(function () {
        $('*').each(function () {
            if ($(this).prop("nodeName") == "P") {
                var textRoot = ""
                $(this).contents().filter(function () {
                    return this.nodeType == Node.TEXT_NODE && this.nodeValue.trim() != '';
                }).each(function () {
                    textRoot += $(this).text();
                });
                if (!$.trim(textRoot)) {
                    var pTags = $(this).children()
                    for (var d = 0; d < pTags.length; d++) {
                        if ([d].nodeName == "FONT" ||
                            pTags[d].nodeName == "I" ||
                            pTags[d].nodeName == "B" ||
                            pTags[d].nodeName == "BOLD" ||
                            pTags[d].nodeName == "EM" ||
                            pTags[d].nodeName == "U" ||
                            pTags[d].nodeName == "STRONG") {
                            postLogToBackend("WCAG 1.3.1 (2.0,A)")
                            window.warningMessage("WCAG 1.3.1 (2.0,A)", "<p> might be misused as a header, its content should not be marked by any of font, i, b, u, em, strong tags", "Use a header tag instead", pTags[d]);
                            replaceElement('header', pTags[d]);
                            break
                        }
                    }
                }
            }
        }

        )
    })

    chrome.runtime.sendMessage({ type: "results", script: "1_3_1_InfoAndRelationships(A)",data: { errors, fixed } });
}