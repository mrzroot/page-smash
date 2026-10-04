const api = globalThis.browser || globalThis.chrome;

api.action.onClicked.addListener(async (tab) => {
  const url = tab?.url || "";
  if (!tab?.id || !/^https?:/i.test(url)) return;
  try {
    await api.tabs.sendMessage(tab.id, { type: "start" });
  } catch (err) {
    try {
      await api.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["vendor/matter.min.js", "game.js"],
      });
      await api.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ["game.css"],
      });
      await api.tabs.sendMessage(tab.id, { type: "start" });
    } catch (inner) {
      /* restricted page */
    }
  }
});
