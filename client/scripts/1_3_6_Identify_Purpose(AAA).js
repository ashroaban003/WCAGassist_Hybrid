setTimeout(() => {
    IdentifyPurpose()
}, 4000);

function IdentifyPurpose() {
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

    

    const roleMap = {
        'SECTION': 'region',
        'FORM': 'form',
        'NAV': 'navigation',    
        'MAIN': 'main',
        'HEADER': 'banner',
        'FOOTER': 'contentinfo',
        'ASIDE': 'complementary',
        'ARTICLE': 'article',
        'ADDRESS': 'contentinfo',
        'H1': 'heading',
        'H2': 'heading',
        'H3': 'heading',
        'H4': 'heading',
        'H5': 'heading',
        'H6': 'heading',
        'BUTTON': 'button',
        'AUDIO': 'audio',
        'VIDEO': 'video',
        'FIGURE': 'figure',
        'TABLE': 'table',
        'TD': 'cell',
        'TH': 'columnheader',
        'TR': 'row',
        'UL': 'list',
        'OL': 'list',
        'LI': 'listitem',
        'DL': 'list',
        'DT': 'term',
        'DD': 'definition'
    }

    $.fn.log = function () {
        console.log.apply(console, this);
        return this;
    };
    $(document).ready(function () {
        $('*').each(function () {
            if ($(this).prop("nodeName") == "SECTION" ||
                $(this).prop("nodeName") == "FORM" ||
                $(this).prop("nodeName") == "NAV" ||
                $(this).prop("nodeName") == "MAIN") {
                var checkRoleAttr = $(this).attr('role');
                if (checkRoleAttr == undefined || checkRoleAttr == false || checkRoleAttr == null) {
                    if(roleMap[$(this).prop("nodeName")]){
                        // new fix : add the apt role if it's there in map
                        errors++;
                        postLogToBackend("WCAG 1.3.6 (2.1,AAA")
                        window.errorMessage("WCAG 1.3.6 (2.1,AAA)", "Using ARIA landmarks to identify regions of a page is Missing", "Add role from roleMap'", $(this));

                        $(this).attr('role', roleMap[$(this).prop("nodeName")]);

                        fixed++;
                    }
                    else{
                        errors++;
                        postLogToBackend("WCAG 1.3.6 (2.1,AAA")
                        window.errorMessage("WCAG 1.3.6 (2.1,AAA)", "Using ARIA landmarks to identify regions of a page is Missing", "Add role='PURPOSE'", $(this));

                        // Fix: Add role attribute
                        $(this).attr('role', 'PURPOSE');

                        fixed++;
                    }
                    
                }
            }
        })
    })

    chrome.runtime.sendMessage({ type: "results", script: "1_3_6_Identify_Purpose(AAA)", data: { errors, fixed } });

}