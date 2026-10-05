document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('masterToggle');
  const toggleVisibility = document.getElementById('toggleVisibility');
  const toggleBlur = document.getElementById('toggleBlur');
  const toggleHasFocus = document.getElementById('toggleHasFocus');
  const toggleMouseLeave = document.getElementById('toggleMouseLeave');
  
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');
  const masterDesc = document.getElementById('masterDesc');
  
  const currentDomainEl = document.getElementById('currentDomain');
  const whitelistBtn = document.getElementById('whitelistBtn');
  
  const domainBlockedCountEl = document.getElementById('domainBlockedCount');
  const totalBlockedCountEl = document.getElementById('totalBlockedCount');
  
  const openTestPageBtn = document.getElementById('openTestPageBtn');
  const resetStatsBtn = document.getElementById('resetStatsBtn');

  let currentDomain = '';
  let currentConfig = {
    enabled: true,
    blockVisibility: true,
    blockBlur: true,
    forceFocus: true,
    blockMouseLeave: true,
    whitelist: []
  };

  // 1. Get current active tab domain
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      try {
        const url = new URL(tabs[0].url);
        currentDomain = url.hostname;
        if (currentDomain) {
          currentDomainEl.textContent = currentDomain;
        } else {
          currentDomainEl.textContent = 'Trang nội bộ';
        }
      } catch (e) {
        currentDomainEl.textContent = 'Không khả dụng';
      }
    } else {
      currentDomainEl.textContent = 'Không khả dụng';
    }

    loadSettings();
  });

  // 2. Load settings from storage
  function loadSettings() {
    chrome.storage.local.get(['antiTabConfig', 'totalBlocked', 'domainStats'], (result) => {
      if (result.antiTabConfig) {
        currentConfig = Object.assign(currentConfig, result.antiTabConfig);
      }

      updateUI();

      // Stats
      const total = result.totalBlocked || 0;
      totalBlockedCountEl.textContent = total.toLocaleString();

      const domainStats = result.domainStats || {};
      const domainCount = currentDomain ? (domainStats[currentDomain] || 0) : 0;
      domainBlockedCountEl.textContent = domainCount.toLocaleString();
    });
  }

  // 3. Update UI according to config
  function updateUI() {
    const isWhitelisted = Array.isArray(currentConfig.whitelist) && 
                          currentConfig.whitelist.includes(currentDomain);
    const isActive = currentConfig.enabled && !isWhitelisted;

    masterToggle.checked = currentConfig.enabled;
    toggleVisibility.checked = currentConfig.blockVisibility;
    toggleBlur.checked = currentConfig.blockBlur;
    toggleHasFocus.checked = currentConfig.forceFocus;
    toggleMouseLeave.checked = currentConfig.blockMouseLeave;

    if (isActive) {
      statusPill.classList.remove('disabled');
      statusText.textContent = 'ĐANG BẬT';
      masterDesc.textContent = 'Tự động phớt lờ sự kiện chuyển tab & rời chuột';
    } else {
      statusPill.classList.add('disabled');
      statusText.textContent = isWhitelisted ? 'ĐÃ TẮT (Trang này)' : 'ĐÃ TẮT';
      masterDesc.textContent = isWhitelisted ? 'Bảo vệ tạm tắt cho trang web này' : 'Toàn bộ tính năng bảo vệ đã bị tắt';
    }

    // Whitelist button state
    if (isWhitelisted) {
      whitelistBtn.classList.add('active');
      whitelistBtn.querySelector('span').textContent = 'Tắt bảo vệ trang này';
    } else {
      whitelistBtn.classList.remove('active');
      whitelistBtn.querySelector('span').textContent = 'Cho vào DS Trắng';
    }
  }

  // 4. Save settings back to storage
  function saveSettings() {
    chrome.storage.local.set({ antiTabConfig: currentConfig }, () => {
      chrome.runtime.sendMessage({
        type: 'TOGGLE_MASTER_SWITCH',
        enabled: currentConfig.enabled
      });
      updateUI();
    });
  }

  // Event Listeners for Toggles
  masterToggle.addEventListener('change', () => {
    currentConfig.enabled = masterToggle.checked;
    saveSettings();
  });

  toggleVisibility.addEventListener('change', () => {
    currentConfig.blockVisibility = toggleVisibility.checked;
    saveSettings();
  });

  toggleBlur.addEventListener('change', () => {
    currentConfig.blockBlur = toggleBlur.checked;
    saveSettings();
  });

  toggleHasFocus.addEventListener('change', () => {
    currentConfig.forceFocus = toggleHasFocus.checked;
    saveSettings();
  });

  toggleMouseLeave.addEventListener('change', () => {
    currentConfig.blockMouseLeave = toggleMouseLeave.checked;
    saveSettings();
  });

  // Whitelist Toggle Button
  whitelistBtn.addEventListener('click', () => {
    if (!currentDomain) return;
    if (!Array.isArray(currentConfig.whitelist)) {
      currentConfig.whitelist = [];
    }

    const index = currentConfig.whitelist.indexOf(currentDomain);
    if (index > -1) {
      currentConfig.whitelist.splice(index, 1);
    } else {
      currentConfig.whitelist.push(currentDomain);
    }
    saveSettings();
  });

  // Open Test Detection Page
  openTestPageBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('test/test_detection.html') });
  });

  // Reset Stats
  resetStatsBtn.addEventListener('click', () => {
    chrome.storage.local.set({ totalBlocked: 0, domainStats: {} }, () => {
      domainBlockedCountEl.textContent = '0';
      totalBlockedCountEl.textContent = '0';
    });
  });
});
