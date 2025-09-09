import React from "react";

export const triggerGoogleTranslate = (targetLanguage: 'fr' | 'en' = 'en') => {
  // Remove temporary notranslate classes
  const elements = document.querySelectorAll('.notranslate-temp');
  elements.forEach(el => {
    el.classList.remove('notranslate-temp');
    if (targetLanguage === 'en') {
      el.classList.add('translate-content');
    } else {
      el.classList.remove('translate-content');
    }
  });

  // Trigger Google Translate
  if (window.google && window.google.translate) {
    const googleSelect = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
    if (googleSelect) {
      const targetValue = targetLanguage === 'en' ? 'en' : 'fr';
      
      if (googleSelect.value !== targetValue) {
        googleSelect.value = targetValue;
        googleSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }
};

/**
 * Wait for Google Translate to be ready before triggering translation
 */
export const waitForGoogleTranslate = (callback: () => void, maxAttempts = 10) => {
  let attempts = 0;
  
  const checkReady = () => {
    attempts++;
    
    const googleSelect = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
    
    if (googleSelect || attempts >= maxAttempts) {
      callback();
    } else {
      setTimeout(checkReady, 1000);
    }
  };
  
  checkReady();
};

/**
 * Initialize translation system for dynamic content
 */
export const initTranslationForDynamicContent = () => {
  // Create a MutationObserver to watch for new content
  const observer = new MutationObserver((mutations) => {
    let hasNewTranslatableContent = false;
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.querySelector('[data-translate="true"]') || element.hasAttribute('data-translate')) {
            hasNewTranslatableContent = true;
          }
        }
      });
    });
    
    if (hasNewTranslatableContent) {
      // Debounce the translation trigger
      clearTimeout(window.translationTimeout);
      window.translationTimeout = setTimeout(() => {
        const currentLang = getCurrentLanguage();
        triggerGoogleTranslate(currentLang);
      }, 500);
    }
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
};

/**
 * Get current language from Google Translate or default
 */
export const getCurrentLanguage = (): 'fr' | 'en' => {
  const googleSelect = document.querySelector('select.goog-te-combo') as HTMLSelectElement;
  if (googleSelect && googleSelect.value === 'en') {
    return 'en';
  }
  return 'fr';
};

/**
 * Hook for components that need translation support
 */
export const useTranslationEffect = (dependencies: any[] = []) => {
  React.useEffect(() => {
    const currentLang = getCurrentLanguage();
    
    // Remove notranslate-temp classes and trigger translation
    setTimeout(() => {
      triggerGoogleTranslate(currentLang);
    }, 100);
    
  }, dependencies);
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any;
    translationTimeout: NodeJS.Timeout;
  }
}