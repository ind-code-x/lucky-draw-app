// Background service worker for the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('GiveawayHub Instagram Comment Collector installed');
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'commentsDetected') {
    // Store detection info
    chrome.storage.local.set({
      commentsDetected: true,
      commentCount: request.count,
      detectedAt: new Date().toISOString()
    });
  }
});

// Clean up old stored data periodically
chrome.alarms.create('cleanup', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    chrome.storage.local.get(['timestamp'], (result) => {
      if (result.timestamp) {
        const age = Date.now() - new Date(result.timestamp).getTime();
        // Clear data older than 24 hours
        if (age > 24 * 60 * 60 * 1000) {
          chrome.storage.local.clear();
        }
      }
    });
  }
});