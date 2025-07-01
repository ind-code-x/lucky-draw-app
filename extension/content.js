// Content script for Instagram comment collection
(function() {
  'use strict';

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'collectComments') {
      const comments = collectComments();
      sendResponse({ comments });
    }
  });

  function collectComments() {
    const comments = [];
    const seenComments = new Set();

    // Wait for page to be fully loaded
    if (document.readyState !== 'complete') {
      return [];
    }

    // Multiple selectors for different Instagram layouts
    const commentSelectors = [
      'article div[role="button"] span',
      'article ul li div span',
      '[data-testid="comment"] span',
      'article section div div span',
      'div[data-testid="comment"] span'
    ];

    commentSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      
      elements.forEach((el, index) => {
        const text = el.textContent?.trim();
        
        if (!text || text.length < 3) return;
        
        // Skip Instagram UI elements
        const skipPatterns = [
          /^(Like|Reply|View replies|Translate|Show more|Hide)$/i,
          /^\d+[smhd]$/,
          /^•$/,
          /^@\w+$/,
          /^(liked by|and \d+ others)$/i
        ];

        if (skipPatterns.some(pattern => pattern.test(text))) {
          return;
        }

        // Find username
        let username = '';
        
        // Look in parent elements for username
        const parentLi = el.closest('li');
        const parentDiv = el.closest('div');
        
        if (parentLi) {
          const usernameLink = parentLi.querySelector('a[href*="/"]');
          if (usernameLink && usernameLink.textContent) {
            username = usernameLink.textContent.trim();
          }
        }
        
        if (!username && parentDiv) {
          const usernameLink = parentDiv.querySelector('a[href*="/"]');
          if (usernameLink && usernameLink.textContent) {
            username = usernameLink.textContent.trim();
          }
        }

        // Fallback username
        if (!username) {
          username = `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        }

        // Clean username
        username = username.replace('@', '').replace(/[^\w.-]/g, '');

        // Create unique identifier
        const commentId = `${username.toLowerCase()}_${text.toLowerCase()}`;
        
        if (!seenComments.has(commentId) && text !== username && text.length > 2) {
          seenComments.add(commentId);
          comments.push({
            username,
            text,
            timestamp: new Date().toISOString(),
            element: el.tagName
          });
        }
      });
    });

    // Remove duplicates and filter valid comments
    const uniqueComments = comments
      .filter((comment, index, self) => 
        index === self.findIndex(c => 
          c.username.toLowerCase() === comment.username.toLowerCase() && 
          c.text.toLowerCase() === comment.text.toLowerCase()
        )
      )
      .filter(comment => 
        comment.text.length >= 3 && 
        comment.username.length >= 2 &&
        !comment.text.match(/^(like|reply|view|translate|show|hide)/i)
      )
      .sort((a, b) => a.username.localeCompare(b.username));

    return uniqueComments;
  }

  // Auto-detect when comments are loaded
  function detectCommentsLoaded() {
    const commentElements = document.querySelectorAll('article div[role="button"] span, article ul li div span');
    return commentElements.length > 0;
  }

  // Notify popup when comments are detected
  if (detectCommentsLoaded()) {
    chrome.runtime.sendMessage({ action: 'commentsDetected', count: document.querySelectorAll('article div[role="button"] span, article ul li div span').length });
  }

})();