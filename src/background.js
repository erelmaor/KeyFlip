// background.js
console.log("KeyFlip background service worker started");

chrome.commands.onCommand.addListener((command) => {
  console.log("Command received:", command);
  if (command !== "fix-layout") return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      console.warn("No active tab found");
      return;
    }
    const tab = tabs[0];

    // Try sending message to content script first
    chrome.tabs.sendMessage(tab.id, { action: "fixSelection" }, (response) => {
      if (chrome.runtime.lastError) {
        // No listener in that tab
        console.warn("sendMessage failed:", chrome.runtime.lastError.message);

        // Don't attempt injection on special pages
        const url = tab.url || "";
        if (url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("about:") || url === "about:blank") {
          console.error("Cannot inject content script into this page:", url);
          return;
        }

        // Try injecting the content scripts programmatically, then re-send message
        chrome.scripting.executeScript(
          { target: { tabId: tab.id }, files: ["src/mapping.js", "src/content.js"] },
          (injectionResults) => {
            if (chrome.runtime.lastError) {
              console.error("Injection failed:", chrome.runtime.lastError.message);
              return;
            }
            // After injection, try again
            chrome.tabs.sendMessage(tab.id, { action: "fixSelection" }, () => {
              if (chrome.runtime.lastError) {
                console.error("Second sendMessage failed:", chrome.runtime.lastError.message);
              } else {
                console.log("Message delivered after injection");
              }
            });
          }
        );
      } else {
        console.log("Message delivered to content script");
      }
    });
  });
});