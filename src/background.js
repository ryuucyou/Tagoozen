chrome.runtime.onInstalled.addListener(() => {
});

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});

// 非表示のショットカットキーを監視
chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-tag-visibility") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { command: "toggle-tag-visibility" });
        });
    }
});
