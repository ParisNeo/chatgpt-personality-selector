chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        selected_personality:0,
        global:{
            "show_help_at_startup":true,
            "selected_personality":0,
            "language":0,
            "voice":"",
            "auto_audio":false
        }
    });
});
