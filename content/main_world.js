(function() {
  'use strict';

  // State configuration (defaults to enabled)
  let config = {
    enabled: true,
    blockVisibility: true,
    blockBlur: true,
    forceFocus: true,
    blockMouseLeave: true
  };

  let blockedCount = 0;

  function notifyBlocked(eventType) {
    blockedCount++;
    try {
      window.postMessage({
        type: 'ANTI_TAB_BLOCKED',
        eventType: eventType,
        count: blockedCount
      }, '*');
    } catch (e) {}
  }

  // Preserve original descriptors and methods
  const originalHiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden') ||
                             Object.getOwnPropertyDescriptor(document, 'hidden');
  const originalVisibilityStateDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState') ||
                                       Object.getOwnPropertyDescriptor(document, 'visibilityState');
  const originalHasFocus = Document.prototype.hasFocus;
  const originalAddEventListener = EventTarget.prototype.addEventListener;

  // 1. Override document.hidden & document.webkitHidden
  try {
    Object.defineProperty(Document.prototype, 'hidden', {
      get: function() {
        if (config.enabled && config.blockVisibility) {
          notifyBlocked('hidden_check');
          return false;
        }
        return originalHiddenDesc ? originalHiddenDesc.get.call(this) : false;
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(Document.prototype, 'webkitHidden', {
      get: function() {
        if (config.enabled && config.blockVisibility) {
          notifyBlocked('webkitHidden_check');
          return false;
        }
        return false;
      },
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    console.warn('[AntiTab] Could not override document.hidden:', e);
  }

  // 2. Override document.visibilityState & document.webkitVisibilityState
  try {
    Object.defineProperty(Document.prototype, 'visibilityState', {
      get: function() {
        if (config.enabled && config.blockVisibility) {
          notifyBlocked('visibilityState_check');
          return 'visible';
        }
        return originalVisibilityStateDesc ? originalVisibilityStateDesc.get.call(this) : 'visible';
      },
      configurable: true,
      enumerable: true
    });

    Object.defineProperty(Document.prototype, 'webkitVisibilityState', {
      get: function() {
        if (config.enabled && config.blockVisibility) {
          notifyBlocked('webkitVisibilityState_check');
          return 'visible';
        }
        return 'visible';
      },
      configurable: true,
      enumerable: true
    });
  } catch (e) {
    console.warn('[AntiTab] Could not override document.visibilityState:', e);
  }

  // 3. Override document.hasFocus()
  try {
    Document.prototype.hasFocus = function() {
      if (config.enabled && config.forceFocus) {
        notifyBlocked('hasFocus_check');
        return true;
      }
      return originalHasFocus.apply(this, arguments);
    };
  } catch (e) {
    console.warn('[AntiTab] Could not override document.hasFocus:', e);
  }

  // 4. Intercept addEventListener
  try {
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      const lowerType = String(type).toLowerCase();
      
      if (config.enabled) {
        if (config.blockVisibility && (lowerType === 'visibilitychange' || lowerType === 'webkitvisibilitychange' || lowerType === 'mozvisibilitychange')) {
          notifyBlocked('addEventListener_' + lowerType);
          return; // Skip adding event listener
        }
        if (config.blockBlur && (lowerType === 'blur' || lowerType === 'focusout' || lowerType === 'pagehide')) {
          notifyBlocked('addEventListener_' + lowerType);
          return; // Skip adding blur/focusout listener
        }
        if (config.blockMouseLeave && (lowerType === 'mouseleave' || lowerType === 'mouseout')) {
          if (this === window || this === document || this === document.documentElement || this === document.body) {
            notifyBlocked('addEventListener_' + lowerType);
            return;
          }
        }
      }

      return originalAddEventListener.call(this, type, listener, options);
    };
  } catch (e) {
    console.warn('[AntiTab] Could not intercept addEventListener:', e);
  }

  // 5. Intercept event propagation in capture phase as backup
  const blockedEventTypes = ['visibilitychange', 'webkitvisibilitychange', 'blur', 'focusout', 'pagehide'];
  
  blockedEventTypes.forEach(evtType => {
    window.addEventListener(evtType, function(e) {
      if (!config.enabled) return;
      if ((evtType.includes('visibility') && config.blockVisibility) ||
          ((evtType === 'blur' || evtType === 'focusout' || evtType === 'pagehide') && config.blockBlur)) {
        e.stopImmediatePropagation();
        e.preventDefault();
        notifyBlocked('captured_event_' + evtType);
      }
    }, true); // Capturing phase
  });

  window.addEventListener('mouseleave', function(e) {
    if (config.enabled && config.blockMouseLeave) {
      if (e.target === window || e.target === document || e.target === document.documentElement || e.target === document.body) {
        e.stopImmediatePropagation();
        e.preventDefault();
        notifyBlocked('captured_event_mouseleave');
      }
    }
  }, true);

  // 6. Nullify direct event handlers (e.g. window.onblur = ..., document.onvisibilitychange = ...)
  try {
    const defineNullProperty = (target, propName, checkFlag) => {
      Object.defineProperty(target, propName, {
        get: function() { return null; },
        set: function(val) {
          if (config.enabled && config[checkFlag]) {
            notifyBlocked('direct_property_' + propName);
            return;
          }
          this['_' + propName] = val;
        },
        configurable: true
      });
    };

    defineNullProperty(window, 'onblur', 'blockBlur');
    defineNullProperty(window, 'onfocusout', 'blockBlur');
    defineNullProperty(window, 'onpagehide', 'blockBlur');
    defineNullProperty(document, 'onvisibilitychange', 'blockVisibility');
  } catch (e) {}

  // Listen for config updates from isolated context
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'ANTI_TAB_UPDATE_CONFIG') {
      config = Object.assign({}, config, event.data.config);
    }
  });

  console.log('🛡️ [AntiTab] Script loaded in MAIN world - Tab detection bypass active.');
})();
