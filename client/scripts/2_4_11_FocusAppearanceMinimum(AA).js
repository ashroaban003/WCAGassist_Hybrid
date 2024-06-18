// hardcode the apikey here, { apiType, apiKey, apiBase, apiVersion, deploymentName } from '../config.js';
const apiType = 'azure';

const apiVersion = '2024-02-01';
const deploymentName = 'trial2'; 
// Function to send a chat message
async function sendMessage(prompt) {
    try {
       // const { apiType, apiKey, apiBase, apiVersion, deploymentName } = await import('../config.mjs');
        const messages = [
            { "role": "user", "content": prompt },
        ];

        const url = `${apiBase}openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
        const headers = {
            'Content-Type': 'application/json',
            'api-key': apiKey
        };
        const body = JSON.stringify({
            messages: messages,
            max_tokens: 25,  // Adjust the max tokens as needed
            temperature: 0.5 // Adjust the temperature as needed
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error Text:', errorText); // Log the error text
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Response Data:', data); // Log the response data
        return data;
    } catch (error) {
        console.error('Error sending message:', error);
    }
}


function FocusAppearanceMinimum() {
    let errors = 0;
    let fixed = 0;
    let count = 0;
    $.fn.log = function () {
        console.log.apply(console, this);
        return this;
    };
    $(document).ready(function () {
        $('*').each(function () {
            if ($(this).prop("tagName") != "HTML" &&
                $(this).prop("tagName") != "BODY" &&
                $(this).prop("tagName") != "LINK" &&
                $(this).prop("tagName") != "SCRIPT" &&
                $(this).prop("tagName") != "STYLE" &&
                $(this).prop("tagName") != "XML" &&
                $(this).prop("tagName") != "HEAD" &&
                $(this).prop("tagName") != "TITLE" &&
                $(this).prop("tagName") != "NOSCRIPT" &&
                $(this).prop("tagName") != "META") {
                var continueLoop = false
                if ($(this).prop("tagName") == "BUTTON" || $(this).prop("tagName") == "INPUT") {
                    if ($(this).prop("disabled")) {
                        continueLoop = true
                    }
                }
                if (!continueLoop && count<500) {
                    // Checking the background contrast
                    var backgroundOnFocus = $(this).focus().css("background-color");
                    var background = $(this).css("background-color");
                    var bgArr = returnColorArr(background);
                    var bgArrOnFocus = returnColorArr(backgroundOnFocus);
                    var contrastGainedBg = contrast(bgArrOnFocus, bgArr);
                    var prompt = `color1: ${background} , color2: ${backgroundOnFocus} ,Dont!!! change or return color1 ,Return an updated color2: if color1 is dark, provide a lighter shade for color2; if color1 is light, give a darker version of color2. Ensure the new color2 doesn't deviate much from the original, and
                     the contrast difference between color1 and the updated color2 is greater than 3. If the updated color2 is #xxxx, NOTE!!! output should be #xxxx ,NO EXTRA SENTENCE ADDED.
                    Don't justify or add extra sentece to output like color2:#xxxx or color1: rgba(x,x,x,x) color2: #xxx,=>output should be directly #xxxx`;
                    
                    if (contrastGainedBg < 3) {
                        count++;
                        errors++;
                        window.errorMessage("WCAG 2.4.11 (2.2,AA)", "The contrast ratio is less than 3:1 for colors in focused and unfocused states", "Increase the contrast ratio to at least 3:1 between colors in focused and unfocused states", $(this));
                        $(this).focus().css("background-color", 'lightgray');
                        sendMessage(prompt).then(response => {
                            console.log('Received response:', response);
                            if (response && response.choices && response.choices.length > 0) {
                                var c2;
                                if (response.choices[0].text) {
                                    c2 = response.choices[0].text;
                                } else if (response.choices[0].message && response.choices[0].message.content) {
                                    c2 = response.choices[0].message.content;
                                }
                                if (c2) {
                                    console.log(c2);
                                    $(this).focus().css("background-color", c2.trim());
                                }
                            }else {
                                console.error('No response generated or response format is unexpected:', response);
                            }
                        }).catch(error => {
                            console.error('Error:', error);
                        });
                         
                        // Fix: Change the background color on focus to white
                        //$(this).focus().css("background-color", 'white');
                        fixed++;
                    }

                    // Checking if outline on focus has 2px thickness, solid color, color contrasting with the background with a ratio more than 3
                    var thicknesspx = $(this).focus().css("outline-width");
                    if (thicknesspx == null || thicknesspx == "" || thicknesspx == undefined) {
                        errors++;
                        window.errorMessage("WCAG 2.4.11 (2.2,AA)", "Element's outline-width on focus found null or empty or undefined", "Set the outline-width property of the element to at least 2px on focus", $(this));

                        // Fix: Add outline-width property
                        $(this).focus().css("outline-width", "2px");
                        fixed++;
                    } else {
                        var thickness = parseInt(thicknesspx.split("px")[0]);
                        if (thickness >= 2) {
                            var outlineStyle = $(this).focus().css("outline-style");
                            if (outlineStyle == "solid") {
                                var focusColor = $(this).focus().css("outline-color");
                                var nonfocusColor = $(this).parent().css("background-color");
                                var nonfocusArr = [];
                                var focusArr = [];
                                nonfocusArr = returnColorArr(nonfocusColor);
                                focusArr = returnColorArr(focusColor);

                                console.log(focusArr, nonfocusArr);
                                var contrastGained = contrast(focusArr, nonfocusArr);
                                if (contrastGained < 3) {
                                    errors++;
                                    window.errorMessage("WCAG 2.4.11 (2.2,AA)", "The contrast ratio is less than 3:1 for colors in focused and unfocused states", "Increase the contrast ratio to at least 3:1 between colors in focused and unfocused states", $(this));

                                    // Fix: Change the outline color
                                    $(this).focus().css("outline-color", "black");
                                    fixed++;
                                }
                            } else {
                                errors++;
                                window.errorMessage("WCAG 2.4.11 (2.2,AA)", "Outline-style of the element on focus is not solid", "Set the outline-style property of the element on focus to 'solid'", $(this));

                                // Fix: Change the outline style
                                $(this).focus().css("outline-style", "solid");
                                fixed++;
                            }
                        } else {
                            errors++;
                            window.errorMessage("WCAG 2.4.11 (2.2,AA)", "Outline-width of the element on focus is less than 2px", "Set the outline-width property of the element to at least 2px on focus", $(this));

                            // Fix: Change the outline width
                            $(this).focus().css("outline-width", "2px");
                            fixed++;
                        }
                    }
                }
            }
        });
    });

    chrome.runtime.sendMessage({ type: "results", script: "2_4_11_FocusAppearanceMinimum(AA)", data: { errors, fixed } });  
}


function luminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(rgb1, rgb2) {
    var lum1 = luminance(parseInt(rgb1[0]), parseInt(rgb1[1]), parseInt(rgb1[2]));
    var lum2 = luminance(parseInt(rgb2[0]), parseInt(rgb2[1]), parseInt(rgb2[2]));
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

function returnColorArr(color) {
    var returnArr = []
    if (color.includes("rgba")) {
        Arr = color.toString().split(")")[0].split("(")[1].split(",")
        var alpha, red, green, blue;
        red = parseInt(Arr[0])
        green = parseInt(Arr[1])
        blue = parseInt(Arr[2])
        alpha = parseInt(Arr[3])
        returnArr.push(Math.round((1 - alpha) * 255 + (alpha * red)))
        returnArr.push(Math.round((1 - alpha) * 255 + (alpha * green)))
        returnArr.push(Math.round((1 - alpha) * 255 + (alpha * blue)))
    } else {
        returnArr = color.toString().split(")")[0].split("(")[1].split(",")
    }
    return returnArr
}

setTimeout(() => {
    FocusAppearanceMinimum()
}, 14000);
