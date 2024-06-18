setTimeout(() => {
    ResizeText();
}, 8000);

function ResizeText() {
    let errors = 0;
    let fixed = 0;

    $.fn.log = function() {
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



    // Handle italic tags
    const italicTags = document.querySelectorAll('i');
    for (let d = 0; d < italicTags.length; d++) {
        errors++;
        window.errorMessage("WCAG 1.4.4 (2.0,AA)", "Found italic tag", "Instead use strong or em tag", italicTags[d]);
        const emElement = document.createElement('em');
        emElement.innerHTML = italicTags[d].innerHTML;
        italicTags[d].parentNode.replaceChild(emElement, italicTags[d]);
        fixed++;
    }

    // Handle bold tags
    const boldTags = document.querySelectorAll('bold');
    for (let d = 0; d < boldTags.length; d++) {
        errors++;
        window.errorMessage("WCAG 1.4.4 (2.0,AA)", "Found bold tag", "Instead use strong or em tag", boldTags[d]);
        const strongElement = document.createElement('strong');
        strongElement.innerHTML = boldTags[d].innerHTML;
        boldTags[d].parentNode.replaceChild(strongElement, boldTags[d]);
        fixed++;
    }

    // Handle font tags
    const fontTags = document.querySelectorAll('font');
    for (let d = 0; d < fontTags.length; d++) {
        errors++;
        window.errorMessage("WCAG 1.4.4 (2.0,AA)", "Found font tag", "Remove it. Avoid using it.", fontTags[d]);
        const pElement = document.createElement('span');
        pElement.innerHTML = fontTags[d].innerHTML;
        fontTags[d].parentNode.replaceChild(pElement, fontTags[d]);
        fixed++;
    }

    $(document).ready(function() {
        // Get the main color of the website
        const mainColor = window.getComputedStyle(document.body).backgroundColor;

        $('*').each(function() {
            // Skip adding '+' (size increase) for links
            if ($(this).closest('a').length) {
                return true;
            }
            
            if ($(this).is("div, span, p, h1, h2, h3, h4, h5, h6, input, q, blockquote, code, pre, ol, li, dl, dt, dd, mark, ins, del, sup, sub, small, i, bold, b, font, em")) {
                var textRoot = ""
                // console.log(`%LOG:%INSIDE THE if clause`, window.ruleStyle, window.infoStyle);
                $(this).contents().filter(function() {
                    // console.log(`%LOG:%INSIDE THE FILTER`, window.ruleStyle, window.infoStyle);
                    return this.nodeType == Node.TEXT_NODE && this.nodeValue.trim() != '';
                }).each(function() {
                    // console.log(`%LOG:%cPASSED THE FILTER`, window.ruleStyle, window.infoStyle);
                    textRoot += $(this).text();
                    $(this).addClass('text-block');
                });
                if ($.trim(textRoot)) {
                    ++errors
                    $(this).addClass('text-block');
                    console.log($(this));
                    // chrome.runtime.sendMessage({ type: "textBlockInfo", textBlocks: [this.outerHTML] });
                    const plusBtn = document.createElement('button');
                    plusBtn.textContent = '+';
                    plusBtn.style.border = 'none';
                    plusBtn.style.position = 'relative';
                    plusBtn.style.left = '15px';
                    
                    // Set the button color to the parent's text color
                    // const parentTextColor = window.getComputedStyle(this).color;
                    plusBtn.style.color = 'black';

                    // Set the button background color to the main color of the website
                    plusBtn.style.backgroundColor = mainColor;

                    const bgColor = window.getComputedStyle(this).backgroundColor;
                    console.log('Background Color:', bgColor);
                    const rgba = bgColor.match(/\d+(\.\d+)?/g);
                    console.log('RGBA Values:', rgba);

                    if (rgba) {
                        const r = parseFloat(rgba[0]);
                        const g = parseFloat(rgba[1]);
                        const b = parseFloat(rgba[2]);
                        const a = parseFloat(rgba[3] || 1); // default to 1 if alpha is not provided

                        // Calculate brightness using the alpha component
                        const brightness = ((r * 299 + g * 587 + b * 114) / 1000) * a + 255 * (1 - a);
                        console.log('Brightness:', brightness);

                        if (brightness > 150) {
                            // Light background
                            plusBtn.style.color = 'black';
                            plusBtn.style.backgroundColor = bgColor;
                        } else {
                            plusBtn.style.color = 'white';
                            plusBtn.style.backgroundColor = bgColor;
                        }
                    } 
                    else {
                        
                        plusBtn.style.color = 'black';
                        plusBtn.style.backgroundColor = 'white';
                    }

                    plusBtn.onclick = function() {
                        let parElement = this.parentElement;
                        let clickCount = parseInt(this.getAttribute('data-click-count')) || 0;
                        if (clickCount < 5) {
                            let fs = parseInt(window.getComputedStyle(parElement).fontSize); 
                            fs += 2;
                            parElement.style.fontSize = fs + 'px'; 
                            clickCount++;
                            this.setAttribute('data-click-count', clickCount);
                        } else {
                            this.disabled = true; 
                            console.log('Btn disabled after 5 clicks!');
                        }
                    };
                    plusBtn.setAttribute('data-click-count', '0');
                    $(this).append(plusBtn);
                    ++fixed
                    console.log(`%cRule:%cWCAG 1.4.4 (2.0,AA)`, window.ruleStyle, window.infoStyle);
                    console.log(`%cSuggestion:%cPlease define width, height, and font-size for the elements that can contain text or take text input in 'em'. This helps in resizing text.`, window.ruleStyle, window.suggestionStyle);
                    console.log(`%cCode Snippet:`, window.codeSnippetStyle);
                    $(this).log();
                    console.log(`%c-----------------------------------------------------------------------------`, window.separatorStyle);
                }
            }
        });
    });

    console.log('%c$ADDED TEXT BLOCK ', ruleStyle);

    chrome.runtime.sendMessage({ type: "results", script: "1_4_4_ResizeText(AA)", data: { errors, fixed } });
}
