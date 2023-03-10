function generateRandomText(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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
      rnd:generateRandomText(10)
    },
  });
});
