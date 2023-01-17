chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        selected_personality:0
    });
});
