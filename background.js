chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    selected_personality: 0,
    global: {
      show_help_at_startup: true,
      selected_category: "",
      selected_personality: "",
      language: 0,
      voice: "",
      auto_audio: false,
    },
  });
});
