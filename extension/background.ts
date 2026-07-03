export {}

// Background service worker for Saule
// Handles cross-tab state, heavy background tasks, and potential future WebSocket connections.

chrome.runtime.onInstalled.addListener(() => {
  console.log("Saule Memory Extension Installed.");
});

// Auto-memory background scanner hook
// If a user is on chatgpt.com or other heavy-context sites, this background script
// could periodically coordinate with content scripts to extract strategic learnings silently.
