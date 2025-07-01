# 🤖 Instagram Comment Collector Scripts

Professional Python scripts for automated Instagram comment collection, working exactly like app-sorteos.com.

## 🚀 Quick Start

### 1. Setup
```bash
# Install Python dependencies
python setup.py

# Or manually:
pip install -r requirements.txt
```

### 2. Basic Usage
```bash
# Collect comments from a single post
python instagram_collector.py "https://www.instagram.com/p/POST_ID/"

# Run in headless mode (no browser window)
python instagram_collector.py "https://www.instagram.com/p/POST_ID/" --headless

# Collect more comments with extra scrolling
python instagram_collector.py "https://www.instagram.com/p/POST_ID/" --max-scrolls 50
```

### 3. Batch Collection
```bash
# Collect from multiple posts
python batch_collector.py
```

## 📋 Features

### ✅ What It Does
- **Automated Login**: Waits for manual Instagram login
- **Smart Scrolling**: Automatically loads more comments
- **Duplicate Detection**: Removes duplicate comments
- **User Verification**: Detects verified accounts
- **Multiple Formats**: Exports to JSON and CSV
- **Batch Processing**: Handle multiple posts at once
- **Rate Limiting**: Built-in delays to avoid detection

### 🎯 Exactly Like app-sorteos.com
- Paste Instagram URL and collect automatically
- Professional comment extraction
- Advanced filtering and validation
- Export results for winner selection
- Works with posts and reels

## 📊 Output Format

### JSON Output
```json
{
  "post_info": {
    "author": "username",
    "caption": "Post caption...",
    "likes": 1234,
    "url": "https://instagram.com/p/...",
    "post_id": "ABC123"
  },
  "collection_stats": {
    "total_comments": 150,
    "unique_users": 142,
    "collection_time": "2024-01-15T10:30:00"
  },
  "comments": [
    {
      "username": "user1",
      "text": "Amazing giveaway! @friend1 @friend2",
      "timestamp": "2024-01-15T10:30:00",
      "profile_url": "https://instagram.com/user1",
      "verified": false
    }
  ]
}
```

## 🔧 Advanced Usage

### Custom Filtering
```python
from instagram_collector import InstagramCommentCollector

collector = InstagramCommentCollector(headless=False)
result = collector.collect_from_url(url)

# Filter comments
valid_comments = [
    comment for comment in result['comments']
    if len(comment['text']) > 10  # Minimum length
    and '@' in comment['text']    # Must tag someone
]
```

### Integration with GiveawayHub
```python
# Collect comments
collector = InstagramCommentCollector()
result = collector.collect_from_url(instagram_url)

# Format for GiveawayHub tool
formatted_comments = []
for comment in result['comments']:
    formatted_comments.append(f"@{comment['username']}: {comment['text']}")

# Copy to clipboard or save to file
with open('comments_for_giveawayhub.txt', 'w') as f:
    f.write('\n'.join(formatted_comments))
```

## 🛠 Configuration

### Environment Variables
```bash
# Optional: Set custom Chrome path
export CHROME_PATH="/path/to/chrome"

# Optional: Set custom ChromeDriver path
export CHROMEDRIVER_PATH="/path/to/chromedriver"
```

### Script Parameters
```python
collector = InstagramCommentCollector(
    headless=False,        # Show browser window
    wait_time=10          # Timeout for elements
)
```

## 🔒 Best Practices

### Rate Limiting
- Use delays between requests
- Don't collect from too many posts rapidly
- Respect Instagram's terms of service

### Account Safety
- Use a dedicated account for collection
- Don't run 24/7 automated collection
- Monitor for any account restrictions

### Data Privacy
- Only collect public comments
- Respect user privacy
- Follow GDPR/privacy regulations

## 🚨 Troubleshooting

### Common Issues

**ChromeDriver not found:**
```bash
# Install ChromeDriver
brew install chromedriver  # macOS
sudo apt install chromium-chromedriver  # Ubuntu
```

**Instagram login required:**
- The script will pause for manual login
- Log in through the browser window
- Press Enter when ready

**No comments found:**
- Make sure the post has comments
- Try scrolling manually first
- Check if comments are restricted

**Rate limiting:**
- Increase delays between requests
- Use headless mode less frequently
- Switch to different IP if needed

### Debug Mode
```bash
# Run with verbose output
python instagram_collector.py URL --debug
```

## 📈 Performance Tips

### Faster Collection
- Use `--headless` for faster execution
- Reduce `--max-scrolls` for quick tests
- Use batch collection for multiple posts

### Better Results
- Increase `--max-scrolls` for more comments
- Wait for peak engagement times
- Ensure stable internet connection

## 🔗 Integration

### With GiveawayHub Web Tool
1. Run the Python script to collect comments
2. Copy the output file content
3. Paste into GiveawayHub's manual import
4. Use advanced filtering and winner selection

### With Other Tools
- Export to CSV for Excel analysis
- JSON format for custom processing
- Direct integration with winner selection tools

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review Instagram's terms of service
- Contact: support@giveawayhub.com

---

**Note**: This tool is for educational and legitimate giveaway purposes only. Always respect Instagram's terms of service and user privacy.