chrome.runtime.onInstalled.addListener(() => {
});
chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});