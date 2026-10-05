// AntiTab Service Worker (Manifest V3)

const defaultConfig = {
  enabled: true,
  blockVisibility: true,
  blockBlur: true,
  forceFocus: true,
  blockMouseLeave: true,
  whitelist: []
};

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['antiTabConfig', 'totalBlocked'], (result) => {
    if (!result.antiTabConfig) {
      chrome.storage.local.set({ antiTabConfig: defaultConfig });
    }
    if (result.totalBlocked === undefined) {
      chrome.storage.local.set({ totalBlocked: 0 });
    }
  });

  updateBadge(true);
});

function updateBadge(enabled) {
  if (enabled) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#00E5FF' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#757575' });
  }
}

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANTI_TAB_EVENT_BLOCKED') {
    chrome.storage.local.get(['totalBlocked', 'domainStats'], (result) => {
      const total = (result.totalBlocked || 0) + 1;
      const domainStats = result.domainStats || {};
      const domain = message.domain || 'unknown';
      domainStats[domain] = (domainStats[domain] || 0) + 1;

      chrome.storage.local.set({
        totalBlocked: total,
        domainStats: domainStats
      });
    });
  } else if (message.type === 'TOGGLE_MASTER_SWITCH') {
    chrome.storage.local.get(['antiTabConfig'], (result) => {
      const config = result.antiTabConfig || defaultConfig;
      config.enabled = message.enabled;
      chrome.storage.local.set({ antiTabConfig: config }, () => {
        updateBadge(config.enabled);
        sendResponse({ success: true, enabled: config.enabled });
      });
    });
    return true; // Keep sendResponse channel open
  }
});
