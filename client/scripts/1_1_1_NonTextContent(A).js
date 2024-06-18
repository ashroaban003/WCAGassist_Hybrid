// hardcode the apikey here from azure, { apiType, apiKey, apiBase, apiVersion, deploymentName } ;
//here we are using a free tier model which does  not give proper video output
const apiType = 'azure';

const apiVersion = '2024-02-01';
const deploymentName = 'trial2'; 
// Function to send a chat message

//1.1.1, 1.4.1,2.4.4
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
          max_tokens: 300,  // Adjust the max tokens as needed
          temperature: 0.5 // Adjust the temperature as needed,high temprature give more creative
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


setTimeout(() => {
  NonTextContent_1_1_1();
}, 1000);

function NonTextContent_1_1_1() {

  var button = document.createElement("button");
  button.style.border = 'none';
  button.style.backgroundImage = 'url(https://store-images.s-microsoft.com/image/apps.56826.14473651905739879.3157c247-dc1f-4da5-b66c-7dec670da6d6.5a91faea-181d-424e-ab8a-8804e7ac0edc?h=464)';
  button.style.backgroundSize = 'cover';
  button.style.backgroundColor = 'darkgray';
  button.style.borderBlockColor = 'black';
  button.style.fontSize = '25px';
  button.style.color = 'white';
  button.style.padding = '0';
  button.style.borderRadius = '50%'; 
  button.style.width = '28px'; 
  button.style.height = '28px';
  button.style.lineHeight = '20px'; 
  button.style.position = 'fixed';
  button.style.bottom = '56px'; 
  button.style.right = '30px'; 
  button.style.zIndex = '100001';
  button.style.cursor = 'pointer'; 
  
  
  button.addEventListener('mouseenter', function() {
      button.style.width = '30px';
      button.style.height = '30px';
      button.style.lineHeight = '26px'; 
  });
  
  // Restore button size on mouse leave
  button.addEventListener('mouseleave', function() {
      button.style.width = '28px';
      button.style.height = '28px';
      button.style.lineHeight = '20px'; 
  });

// Create chatbox container
const chatbox = document.createElement('div');
chatbox.id = 'chatbox';
chatbox.style.cssText = `
position: fixed;
bottom: 0;
right: 0;
width: 300px;
height: 400px;
background-color: lightgray;
border: 1px solid #ddd;
border-radius: 10px;
box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
display: flex;
flex-direction: column;
overflow: hidden;
`;
chatbox.style.zIndex='-100000';
chatbox.style.visibility = 'hidden';

// Create message container
const messageContainer = document.createElement('div');
messageContainer.id = 'message-container';
messageContainer.style.cssText = `
flex: 1;
padding: 10px;
overflow-y: auto;
`;
chatbox.appendChild(messageContainer);

// Create input container
const inputContainer = document.createElement('div');
inputContainer.style.cssText = `
display: flex;
border-top: 1px solid #ddd;
`;

// Create input field
const inputField = document.createElement('input');
inputField.id = 'chat-input';
inputField.type = 'text';
inputField.placeholder = 'provide url of video/image/link';
inputField.style.cssText = `
flex: 1;
padding: 10px;
border: none;
border-radius: 0;
outline: none;
`;
inputContainer.appendChild(inputField);

// Create send button
const sendButton = document.createElement('button');
sendButton.id = 'send-button';
sendButton.textContent = 'Summarize';
sendButton.style.cssText = `
padding: 10px;
border: none;
background-color: #007bff;
color: white;
cursor: pointer;
`;
inputContainer.appendChild(sendButton);

// Append input container to chatbox
chatbox.appendChild(inputContainer);

// Function to create a message element
const createMessageElement = (message, className) => {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messageElement.className = className;
  messageElement.style.cssText = `
    margin: 5px 0;
    padding: 10px;
    border-radius: 5px;
    max-width: 80%;
    word-wrap: break-word;
  `;

  if (className === 'user-message') {
    messageElement.style.cssText += `
      align-self: flex-end;
      background-color: #e1ffc7;
    `;
  } else {
    messageElement.style.cssText += `
      align-self: flex-start;
      background-color: #f1f1f1;
    `;
  }

  return messageElement;
};

// Handle user input and send button click
sendButton.addEventListener('click', async () => {
  const userInput = inputField.value.trim();
  if (userInput) {
    // Clear previous messages
    messageContainer.innerHTML = '';

  //   // Add user message to chatbox
  //   const userMessage = createMessageElement(userInput, 'user-message');
  //   messageContainer.appendChild(userMessage);

    // Get llm response
    const response = await getChatbotResponse(userInput);
    const chatbotMessage = createMessageElement(response, 'chatbot-message');
    messageContainer.appendChild(chatbotMessage);

    // Clear input field and scroll to bottom
    inputField.value = '';
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
});

const getChatbotResponse = async (message) => {
  const prompt = `${message}  if this link is a video/image link summarize it. else if its link to some other page say what this link does`;

  try {
      const response = await sendMessage(prompt);
      console.log('Received response:', response);

      if (response && response.choices && response.choices.length > 0) {
          const choice = response.choices[0];
          if (choice.text) {
              return choice.text;
          } else if (choice.message && choice.message.content) {
              return choice.message.content;
          }
      } else {
          console.error('No response generated or response format is unexpected:', response);
          return 'No valid response received from the AI.';
      }
  } catch (error) {
      console.error('Error:', error);
      return 'An error occurred while processing your request. Please try again.';
  }
};
button.onclick=function(){
  var swap= chatbox.style.zIndex;
  if(swap=='100000'){
            // Clear previous messages
          messageContainer.innerHTML = '';
          chatbox.style.zIndex='-100000';
          chatbox.style.visibility = 'hidden';
          button.style.backgroundImage = 'url(https://store-images.s-microsoft.com/image/apps.56826.14473651905739879.3157c247-dc1f-4da5-b66c-7dec670da6d6.5a91faea-181d-424e-ab8a-8804e7ac0edc?h=464)';
  }
  else{
      chatbox.style.zIndex='100000';
      chatbox.style.visibility = 'visible';
      button.style.backgroundImage = 'url(https://cdn.pixabay.com/photo/2017/02/12/21/29/false-2061132_640.png)';

  }
}
// Append chatbox to the body
document.body.appendChild(chatbox);


document.body.appendChild(button);





   //commenting below work that doesnt do much to code just log the content,can use it if required

    // let errors = 0;
    // let fixed = 0;

    // $.fn.log = function () {
    //     console.log.apply(console, this);
    //     return this;
    // };
    // var videoTags = document.querySelectorAll("video")
    // for (let index = 0; index < videoTags.length; index++) {
    //     if (videoTags.getAttribute("aria-label") == "" || videoTags.getAttribute("aria-label") == null) {
    //         errors += 1;
    //         window.errorMessage("WCAG 1.1.1 (2.0,A)", "Non-text content Video-only should have descriptive label", "Specify a descriptive label that denotes as the title of the video using `aria-label` attribute for the video tag", videoTags[index]);

    //         // Fix: Add aria-label attribute
    //         videoTags[index].setAttribute('aria-label', ' ');
    //         fixed += 1;
    //     }
    // }
    // var audioTags = document.querySelectorAll("audio")
    // for (let index = 0; index < audioTags.length; index++) {
    //     if (audioTags.getAttribute("aria-label") == "" || audioTags.getAttribute("aria-label") == null) {
    //         errors += 1;
    //         window.errorMessage("WCAG 1.1.1 (2.0,A)", "Non-text content Audio-only should have descriptive label", "Specify a descriptive label that denotes as the title of the audio using `aria-label` attribute for the audio tag", audioTags[index]);

    //         // Fix: Add aria-label attribute
    //         audioTags[index].setAttribute('aria-label', ' ');
    //         fixed += 1;
    //     }
    // }
    // var trackTags = document.querySelectorAll("track")
    // for (let index = 0; index < trackTags.length; index++) {
    //     if (trackTags.parentNode.nodeName == "VIDEO") {
    //         if (trackTags.getAttribute("kind") == "subtitles") {
    //             if (trackTags.getAttribute("label") == "" || trackTags.getAttribute("label") == null) {
    //                 errors += 1;
    //                 window.errorMessage("WCAG 1.1.1 (2.0,A)", "Non-text content - audio/video descriptive track must have a descriptive label", "Specify a descriptive label that denotes some information of the track using `label` attribute for the track tag", trackTags[index]);

    //                 // Fix: Add label attribute
    //                 trackTags[index].setAttribute('label', ' ');
    //                 fixed += 1;
                    
    //             }
    //         }
    //     }
    // }
    // var sourceTags = document.querySelectorAll("source")
    // for (let index = 0; index < sourceTags.length; index++) {
    //     if (sourceTags.parentNode.nodeName == "VIDEO") {
    //         if (sourceTags.getAttribute("kind") == "subtitles") {
    //             if (sourceTags.getAttribute("label") == "" || sourceTags.getAttribute("label") == null) {
    //                 errors += 1;
    //                 window.errorMessage("WCAG 1.1.1 (2.0,A)", "Non-text content - audio descriptive source must have a descriptive label", "Specify a descriptive label that denotes some information of the source using `label` attribute for the source tag", sourceTags[index]);

    //                 // Fix: Add label attribute
    //                 sourceTags[index].setAttribute('label', ' ');
    //                 fixed += 1;
                    
    //             }
    //         }
    //     }

    // }
    // var inpTags = document.querySelectorAll("input")
    // for (let index = 0; index < inpTags.length; index++) {
    //     if (inpTags[index].type == "image" && inpTags[index].parentNode.nodeName == "FORM") {
    //         if (inpTags[index].alt != null && inpTags[index].alt != "") {
    //             errors += 1;
    //             window.errorMessage("WCAG 1.1.1 (2.0,A)", "Form input element of type `image` is missing alt text", "Specify a short text alternative with the alt attribute for every input `type=image` inside a form", inpTags[index]);

    //             // Fix: Add alt attribute
    //             inpTags[index].setAttribute('alt', ' ');
    //             fixed += 1;
                
    //         }
    //     }
    // }
    // var areaTags = document.querySelectorAll("area")
    // for (let index = 0; index < areaTags.length; index++) {
    //     if (areaTags[index].parentNode.nodeName == "MAP") {
    //         var imgParentTags = document.querySelectorAll('img')
    //         for (let iter = 0; iter < imgParentTags.length; iter++) {
    //             var useMapName = "#" + areaTags[index].parentNode.name
    //             if (useMapName == imgParentTags[iter].useMap) {
    //                 if (areaTags[index].alt == null || areaTags.alt == "") {
    //                     errors += 1;
    //                     window.errorMessage("WCAG 1.1.1 (2.0,A)", "Alt text for the client-side <area> element of an image map is missing alt text", "Specify a short text alternative with the alt attribute for every client-side <area> element of an image map", areaTags[index]);

    //                     // Fix: Add alt attribute
    //                     areaTags[index].setAttribute('alt', ' ');
    //                     fixed += 1;
    //                 }
    //                 if (imgParentTags[index].alt == null || imgParentTags.alt == "") {
    //                     errors += 1;
    //                     window.errorMessage("WCAG 1.1.1 (2.0,A)", "Alt text for the client-side <img> element of an image map is missing alt text", "Specify a short text alternative with the alt attribute for every client-side <img> element of an image map", imgParentTags[index]);

    //                     // Fix: Add alt attribute
    //                     imgParentTags[index].setAttribute('alt', ' ');
    //                     fixed += 1;
    //                 }
    //             }
    //         }
    //     }
    // }

    // var imgTags = document.querySelectorAll('img')
    // for (var a = 0; a < imgTags.length; a++) {
    //     if (imgTags[a].src == null || imgTags[a].src == undefined || imgTags[a].src == "") {
    //         errors += 1;
    //         window.errorMessage("WCAG 1.1.1 (2.0,A)", "Image Source is missing.", "Add src='<source>", imgTags[a]);

    //         // Fix: Add src attribute
    //         imgTags[a].setAttribute('src', ' ');
    //         fixed += 1;

    //     }
    //     var par = imgTags[a].parentNode.nodeName
    //     if (par != null) {
    //         if (imgTags[a].parentNode.textContent == "" || imgTags[a].parentNode.textContent == null) {
    //             if (imgTags[a].alt != null && imgTags[a].alt != "") {
    //                 // no violation
    //                 if (imgTags[a].role == "presentation") {
    //                     errors += 1;
    //                     window.errorMessage("WCAG 1.1.1 (2.0,A)", "Decorative image is enclosed in a parent node and alt text is present", "For a decorative image, do not specify a short text alternative with the alt attribute", imgTags[a]);
                        
    //                     // Fix: Remove the alt attribute
    //                     imgTags[a].removeAttribute('alt');
    //                     fixed += 1;
    //                 }
    //             } else {
    //                 if (imgTags[a].role != "presentation") {
    //                     errors += 1;
    //                     window.errorMessage("WCAG 1.1.1 (2.0,A)", "The image is enclosed in a parent node and alt text is either null or empty", "When using the img element, specify a short text alternative with the alt attribute", imgTags[a]);

    //                     // Fix: Add alt attribute
    //                     imgTags[a].setAttribute('alt', ' ');
    //                     fixed += 1;
    //                 }

    //             }
    //         }
    //     }
    //     if (imgTags[a].alt == "" || imgTags[a].alt == null) {
    //         if (imgTags[a].title != "" && imgTags[a].title != null) {
    //             if (imgTags[a].role == "presentation") {
    //                 errors += 1;
    //                 window.errorMessage("WCAG 1.1.1 (2.0,A)", "The image element seems to be a decorative one and it has a title attribute", "In case of a decorative image the title attribute should either be empty or null", imgTags[a]);

    //                 // Fix: Remove the title attribute
    //                 imgTags[a].removeAttribute('title');
    //                 fixed += 1;
    //             } else {
    //                 errors += 1;
    //                 window.warningMessage("WCAG 1.1.1 (2.0,A)", "The image element might be a decorative and it has a title attribute", "In case of a decorative image the title attribute should either be empty or null", imgTags[a]);
    //             }
    //         }
    //     }
    //     if (imgTags[a].role != "presentation") {
    //         errors += 1;
    //         window.errorMessage("WCAG 1.1.1 (2.0,A)", "The image element is missing the alt attribute", "Add an alt attribute. If the image is for decorative purposes, define `role=presentation`", imgTags[a]);

    //         // Fix: Add alt attribute
    //         imgTags[a].setAttribute('alt', ' ');
    //         fixed += 1;
    //     }
    //     if (imgTags[a].alt.split(" ").length <= 2) {
    //         if (imgTags[a].title != "" && imgTags[a].title != null) {
    //             if (imgTags[a].role == "presentation") {
    //                 errors += 1;
    //                 window.errorMessage("WCAG 1.1.1 (2.0,A)", "The image element seems to be a decorative one and title attribute was found", "Remove the title attribute or make title empty for a decorative image", imgTags[a]);

    //                 // Fix: Remove the title attribute
    //                 imgTags[a].removeAttribute('title');
    //                 fixed += 1;
    //             }
    //         }
    //         window.warningMessage("WCAG 1.1.1 (2.0,A)", "The image element might be decorative and a non-empty alt text was found", "Remove the alt attribute or make alt text empty for a decorative image", imgTags[a]);

    //     }
    //     else {
    //         window.warningMessage("WCAG 1.1.1 (2.0,A)", "The image element might be decorative and a non-empty alt text was found", "Remove the alt attribute or make alt text empty for a decorative image", imgTags[a]);


    //     }
    // }

    // chrome.runtime.sendMessage({ type: "results", script: "1_1_1_NonTextContent(A)",data: { errors, fixed } });


    
}
