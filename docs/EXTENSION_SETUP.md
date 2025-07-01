# 🚀 GiveawayHub Browser Extension Setup Guide

## 📋 Prerequisites

- Google Chrome or Chromium-based browser
- Developer mode enabled in Chrome Extensions
- Basic understanding of browser extensions

## 🛠 Installation Steps

### Step 1: Download Extension Files

1. Download all files from the `extension/` folder
2. Create a new folder on your computer called `giveawayhub-extension`
3. Copy all extension files into this folder

### Step 2: Add Extension Icons

Create or download icon files and place them in the `extension/icons/` folder:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

### Step 3: Enable Developer Mode

1. Open Chrome and go to `chrome://extensions/`
2. Toggle "Developer mode" in the top right corner
3. You should see new buttons appear: "Load unpacked", "Pack extension", "Update"

### Step 4: Load the Extension

1. Click "Load unpacked"
2. Navigate to your `giveawayhub-extension` folder
3. Select the folder and click "Select Folder"
4. The extension should now appear in your extensions list

### Step 5: Pin the Extension

1. Click the puzzle piece icon in Chrome's toolbar
2. Find "GiveawayHub Instagram Comment Collector"
3. Click the pin icon to pin it to your toolbar

## 🎯 How to Use

### Collecting Comments:

1. **Navigate to Instagram**: Go to any Instagram post with comments
2. **Open Extension**: Click the GiveawayHub extension icon
3. **Collect Comments**: Click "Collect Comments" button
4. **Copy or Export**: Use the copy or export buttons to get your data

### Advanced Features:

- **Auto-Detection**: Extension automatically detects Instagram posts
- **Duplicate Filtering**: Removes duplicate comments from same users
- **Export Options**: Save as JSON for detailed analysis
- **Real-time Stats**: See comment count and unique users

## 🔧 Troubleshooting

### Extension Not Loading:
- Check that all files are in the correct folder structure
- Ensure `manifest.json` is in the root of the extension folder
- Try refreshing the extensions page

### Comments Not Collecting:
- Make sure you're on an Instagram post page (not profile or feed)
- Scroll down to load more comments before collecting
- Try refreshing the Instagram page and collecting again

### Permission Issues:
- The extension only works on `instagram.com` domains
- Make sure you've granted necessary permissions

## 🔒 Privacy & Security

- **Local Processing**: All comment collection happens locally in your browser
- **No Data Transmission**: Comments are not sent to external servers
- **Temporary Storage**: Data is automatically cleared after 24 hours
- **User Control**: You control when and what data is collected

## 📊 Features Comparison

| Feature | Bookmarklet | Browser Extension |
|---------|-------------|-------------------|
| Setup Complexity | Easy | Moderate |
| Auto-Detection | No | Yes |
| Real-time Stats | No | Yes |
| Export Options | Basic | Advanced |
| Persistent Storage | No | Yes |
| Update Mechanism | Manual | Automatic |

## 🚀 Publishing to Chrome Web Store

To publish this extension to the Chrome Web Store:

1. **Create Developer Account**: Register at [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. **Prepare Assets**: Create store listing images and descriptions
3. **Package Extension**: Create a ZIP file of the extension folder
4. **Submit for Review**: Upload and submit for Google's review process
5. **Publication**: Once approved, users can install directly from the store

## 🔄 Updates & Maintenance

- **Version Control**: Update `version` in `manifest.json` for each release
- **Feature Additions**: Add new functionality in content scripts
- **Bug Fixes**: Test thoroughly before releasing updates
- **User Feedback**: Monitor reviews and user reports for improvements

## 📞 Support

For technical support or feature requests:
- Email: support@giveawayhub.com
- Documentation: [GiveawayHub Help Center](https://giveawayhub.com/help)
- GitHub Issues: Report bugs and request features