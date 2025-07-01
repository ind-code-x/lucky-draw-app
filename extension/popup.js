document.addEventListener('DOMContentLoaded', async () => {
  const collectBtn = document.getElementById('collect-btn');
  const copyBtn = document.getElementById('copy-btn');
  const exportBtn = document.getElementById('export-btn');
  const loading = document.getElementById('loading');
  const stats = document.getElementById('stats');
  const commentCount = document.getElementById('comment-count');
  const userCount = document.getElementById('user-count');
  const notInstagram = document.getElementById('not-instagram');
  const instagramDetected = document.getElementById('instagram-detected');

  let collectedComments = [];

  // Check if we're on Instagram
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isInstagram = tab.url && tab.url.includes('instagram.com');

  if (!isInstagram) {
    notInstagram.style.display = 'flex';
    return;
  }

  instagramDetected.style.display = 'flex';
  collectBtn.disabled = false;

  // Check if we already have collected comments
  const stored = await chrome.storage.local.get(['comments', 'postUrl']);
  if (stored.comments && stored.postUrl === tab.url) {
    collectedComments = stored.comments;
    updateStats();
    showResults();
  }

  collectBtn.addEventListener('click', async () => {
    loading.style.display = 'flex';
    
    try {
      // Inject and execute the content script
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: collectInstagramComments
      });

      if (result.result && result.result.length > 0) {
        collectedComments = result.result;
        
        // Store the results
        await chrome.storage.local.set({
          comments: collectedComments,
          postUrl: tab.url,
          timestamp: new Date().toISOString()
        });

        updateStats();
        showResults();
      } else {
        alert('No comments found. Make sure the post has comments and they are loaded.');
      }
    } catch (error) {
      console.error('Error collecting comments:', error);
      alert('Error collecting comments. Please try again.');
    } finally {
      loading.style.display = 'none';
    }
  });

  copyBtn.addEventListener('click', async () => {
    const formattedComments = collectedComments
      .map(comment => `@${comment.username}: ${comment.text}`)
      .join('\n');

    try {
      await navigator.clipboard.writeText(formattedComments);
      
      // Visual feedback
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Copied!
      `;
      
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  });

  exportBtn.addEventListener('click', () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      postUrl: tab.url,
      totalComments: collectedComments.length,
      uniqueUsers: new Set(collectedComments.map(c => c.username.toLowerCase())).size,
      comments: collectedComments
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `instagram-comments-${new Date().toISOString().split('T')[0]}.json`
    });
  });

  function updateStats() {
    const uniqueUsers = new Set(collectedComments.map(c => c.username.toLowerCase())).size;
    commentCount.textContent = collectedComments.length;
    userCount.textContent = uniqueUsers;
    stats.style.display = 'flex';
  }

  function showResults() {
    copyBtn.style.display = 'flex';
    exportBtn.style.display = 'flex';
  }
});

// This function will be injected into the Instagram page
function collectInstagramComments() {
  const comments = [];
  const seenComments = new Set();

  // Multiple selectors to catch different comment layouts
  const commentSelectors = [
    'article div[role="button"] span',
    'article ul li div span',
    '[data-testid="comment"] span',
    'article section div div span'
  ];

  commentSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach((el, index) => {
      const text = el.textContent?.trim();
      
      if (!text || text.length < 3) return;
      
      // Skip Instagram UI elements
      if (text.includes('•') || 
          text.includes('View replies') || 
          text.includes('Like') ||
          text.includes('Reply') ||
          text.includes('Translate') ||
          text.includes('ago') ||
          text.match(/^\d+[smhd]$/)) {
        return;
      }

      // Try to find username
      let username = '';
      
      // Look for username in parent elements
      const parentLi = el.closest('li');
      const parentDiv = el.closest('div');
      
      if (parentLi) {
        const usernameLink = parentLi.querySelector('a');
        if (usernameLink && usernameLink.textContent) {
          username = usernameLink.textContent.trim();
        }
      }
      
      if (!username && parentDiv) {
        const usernameLink = parentDiv.querySelector('a');
        if (usernameLink && usernameLink.textContent) {
          username = usernameLink.textContent.trim();
        }
      }

      // Fallback username
      if (!username) {
        username = `user_${index + 1}`;
      }

      // Create unique identifier for deduplication
      const commentId = `${username.toLowerCase()}_${text.toLowerCase()}`;
      
      if (!seenComments.has(commentId) && text !== username) {
        seenComments.add(commentId);
        comments.push({
          username: username.replace('@', ''),
          text: text,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // Remove duplicates and sort by username
  const uniqueComments = comments.filter((comment, index, self) => 
    index === self.findIndex(c => 
      c.username.toLowerCase() === comment.username.toLowerCase() && 
      c.text.toLowerCase() === comment.text.toLowerCase()
    )
  );

  return uniqueComments.sort((a, b) => a.username.localeCompare(b.username));
}