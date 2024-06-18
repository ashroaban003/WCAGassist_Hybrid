const ruleStyle = `color: #FFF;
                        background-color: #333;
                        border-radius: 5px 0px 0px 5px;
                        padding: 5px 10px;
                        font-size: 0.8rem;
                        display: inline;
                        box-shadow: 0 0 25px rgba(0, 0, 0, 0.05);`;

 const infoStyle = `color: #FFF;
                        display: inline;
                        font-size: 0.8rem;
                        background-color: #809FFF;
                        border-radius: 0px 5px 5px 0px;
                        padding: 5px 10px;
                        box-shadow: 0 0 25px rgba(0, 0, 0, 0.05);`;

 const errorStyle = `color: #FFF;
                        display: inline;
                        font-size: 0.8rem;
                        background-color: #EB5177;
                        border-radius: 0px 5px 5px 0px;
                        padding: 5px 10px;
                        box-shadow: 0 0 25px rgba(0, 0, 0, 0.05);`;

 const codeSnippetStyle = `color: #FFF;
                               background-color: #333;
                               border-radius: 5px;
                               padding: 5px 10px;
                               font-size: 0.8rem;
                               display: inline;
                               box-shadow: 0 0 25px rgba(0, 0, 0, 0.05);`;

 const fixStyle = `color: #FFF;
                       display: inline;
                       font-size: 0.8rem;
                       background-color: #007075;
                       border-radius: 0px 5px 5px 0px;
                       padding: 5px 10px;
                       box-shadow: 0 0 25px rgba(0, 0, 0, 0.05);`;

 const separatorStyle = `color: #FFF;
                             background-color: #293543;
                             font-weight: bolder;
                             border-radius: 5px;
                             padding: 5px 10px;
                             font-size: 1rem;
                             display: inline;`;

 const warningStyle = `color: #FFF;
                            display: inline;
                            font-size: 0.8rem;
                            background-color: #F6976E;
                            border-radius: 0px 5px 5px 0px;
                            padding: 5px 10px;
                            box-shadow: 0 0 25px rgba(0, 0, 0, 0.05);`;

document.addEventListener('DOMContentLoaded', function() {
    // Function to update the popup UI with the tab data
    function updatePopupUI(tabData) {
        const tableContainer = document.getElementById("tableContainer");
        tableContainer.innerHTML = ""; // Clear previous content

        // Create a table element
        const table = document.createElement("table");
        table.classList.add("results-table");

        // Create a header row
        const headerRow = table.insertRow();
        headerRow.classList.add("header-row");
        const scriptHeader = document.createElement("th");
        scriptHeader.textContent = "Rule";
        headerRow.appendChild(scriptHeader);
        const errorsHeader = document.createElement("th");
        errorsHeader.textContent = "Errors";
        headerRow.appendChild(errorsHeader);
        const fixedHeader = document.createElement("th");
        fixedHeader.textContent = "Fixed";
        headerRow.appendChild(fixedHeader);

        // Iterate over each script in the tab data
        Object.keys(tabData).forEach(scriptName => {
            const rowData = tabData[scriptName];
            const row = table.insertRow();
            const scriptCell = row.insertCell();
            scriptCell.textContent = scriptName;
            const errorsCell = row.insertCell();
            errorsCell.textContent = rowData.errors;
            const fixedCell = row.insertCell();
            fixedCell.textContent = rowData.fixed;
        });

        // Append the table to the container
        tableContainer.appendChild(table);
    }

    // Function to draw the chart using CanvasJS library
    function drawChart(scriptNames, errorsCounts, fixedCounts, container) {
        const data = scriptNames.map((scriptName, index) => ({
            scriptName,
            errors: errorsCounts[index],
            fixed: fixedCounts[index]
        }));

        const chart = new CanvasJS.Chart(container, {
            animationEnabled: true,
            title: {
                text: "Script Results"
            },
            axisY: {
                title: "Number"
            },
            axisX: {
                title: "Script",
                interval: 1
            },
            data: [{
                    type: "column",
                    name: "Errors",
                    showInLegend: true,
                    dataPoints: data.map(entry => ({
                        label: entry.scriptName,
                        y: entry.errors
                    }))
                },
                {
                    type: "column",
                    name: "Fixed",
                    showInLegend: true,
                    dataPoints: data.map(entry => ({
                        label: entry.scriptName,
                        y: entry.fixed
                    }))
                }
            ]
        });

        chart.render();
    }

    // Retrieve errors and fixed data from storage for the active tab
    console.log("Popup script running");
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const tabId = tabs[0].id;
        chrome.storage.local.get([tabId.toString()], function(result) {
            const tabData = result[tabId.toString()] || {};
            console.log(tabData);
            // Update UI with errors and fixed data
            updatePopupUI(tabData);
        });
    });

    // Listen for changes in storage and update UI when data changes
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        // Check if changes are relevant to the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tabId = tabs[0].id;
            if (changes[tabId.toString()]) {
                const newData = changes[tabId.toString()].newValue || {};
                console.log(newData);
                // Update UI with new data
                updatePopupUI(newData);
            }
        });
    });

    document.getElementById('generatePDFButton').addEventListener('click', generatePDF);

    function generatePDF() {
        // Fetch logs from the backend
        fetch('http://localhost:4000/api/post')
            .then(response => response.json())
            .then(logs => {
                // Create a temporary div to hold the log content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = `
                    <h1>Console Logs</h1>
                    ${logs.map(log => `
                        <div>
                            <p>Rule: ${log.rule}</p>
                            <br>
                            <br>
                        </div>
                    `).join('')}
                `;
    
                // Use html2pdf.js to generate the PDF
                html2pdf().from(tempDiv).set({
                    margin: 10,
                    filename: 'ConsoleLogs.pdf',
                    html2canvas: { scale: 2 },
                    jsPDF: { format: 'a4', orientation: 'portrait' }
                }).save().then(function () {
                    // Clear the logs in local storage if needed
                    // chrome.storage.local.set({ consoleLogs: [] });
                    clearLogs();
                });
            })
            .catch(error => {
                console.error('Error fetching logs:', error);
            });
    }
});

function clearLogs() {
    fetch('http://localhost:4000/api/post', {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log('Logs cleared from backend');
        } else {
            console.error('Failed to clear logs from backend');
        }
    })
    .catch(error => {
        console.error('Error clearing logs from backend:', error);
    });
}
