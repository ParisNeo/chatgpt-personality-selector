chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        selected_personality:0,
        global:{
            "selected_personality":0,
            "language":0
          }
    });
});
