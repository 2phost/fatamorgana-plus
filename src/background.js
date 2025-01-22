chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "GET_GLOBAL_DATA") {
        // Inject script to access global variable
        chrome.scripting.executeScript({
            target: {tabId: sender.tab.id}, world: "MAIN", // Access the main world context
            func: () => {
                try {
                    // Access the global variable
                    return window.data; // Return the global variable
                } catch (e) {
                    console.error("Error accessing global data:", e);
                    return {error: "Unable to access global data"};
                }
            }
        }, (injectionResults) => {
            if (chrome.runtime.lastError) {
                sendResponse({error: chrome.runtime.lastError.message});
            } else if (injectionResults && injectionResults[0]) {
                sendResponse({data: injectionResults[0].result});
            } else {
                sendResponse({error: "No result from injection"});
            }
        });

        // Indicate that the response will be sent asynchronously
        return true;
    }
});
