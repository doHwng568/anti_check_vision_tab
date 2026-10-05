(function() {
  'use strict';

  // Default configuration
  const defaultConfig = {
    enabled: true,
    blockVisibility: true,
    blockBlur: true,
    forceFocus: true,
    blockMouseLeave: true,
    whitelist: []
  };

  function getDomain() {
    return window.location.hostname;
  }

  function loadAndApplyConfig() {
    chrome.storage.local.get(['antiTabConfig', 'blockedStats'], (result) => {
      const storedConfig = result.antiTabConfig || defaultConfig;
      const currentDomain = getDomain();
      
      const isWhitelisted = Array.isArray(storedConfig.whitelist) && 
                            storedConfig.whitelist.includes(currentDomain);
      
      const activeConfig = {
        enabled: storedConfig.enabled && !isWhitelisted,
        blockVisibility: storedConfig.blockVisibility,
        blockBlur: storedConfig.blockBlur,
        forceFocus: storedConfig.forceFocus,
        blockMouseLeave: storedConfig.blockMouseLeave
      };

      // Send to MAIN world script via postMessage
      window.postMessage({
        type: 'ANTI_TAB_UPDATE_CONFIG',
        config: activeConfig
      }, '*');
    });
  }

  // Initial load
  loadAndApplyConfig();

  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.antiTabConfig) {
      loadAndApplyConfig();
    }
  });

  // Listen for blocked notification messages from MAIN world
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'ANTI_TAB_BLOCKED') {
      const currentDomain = getDomain();
      chrome.runtime.sendMessage({
        type: 'ANTI_TAB_EVENT_BLOCKED',
        domain: currentDomain,
        eventType: event.data.eventType
      });
    }
  });
})();
