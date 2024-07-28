document.addEventListener('DOMContentLoaded', function() {
    const optionsButton = document.getElementById('optionsButton');
    if (optionsButton) {
      optionsButton.addEventListener('click', () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
      });
    } else {
      console.error('Options button not found');
    }
});