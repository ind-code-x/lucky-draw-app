#!/usr/bin/env python3
"""
Generate Instagram Comment Collection Bookmarklet
Creates a JavaScript bookmarklet for one-click comment collection
"""

def generate_bookmarklet():
    """Generate the Instagram comment collection bookmarklet"""
    
    # JavaScript code for comment collection
    js_code = """
(function() {
    // Instagram Comment Collector Bookmarklet
    // Works exactly like app-sorteos.com
    
    if (!window.location.href.includes('instagram.com')) {
        alert('❌ Please run this on an Instagram post page!');
        return;
    }
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'giveawayhub-collector';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    `;
    
    modal.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #be185d; margin: 0 0 8px 0; font-size: 24px;">🎉 GiveawayHub Collector</h2>
            <p style="color: #666; margin: 0; font-size: 14px;">Professional Instagram comment collection</p>
        </div>
        
        <div id="status" style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <div id="spinner" style="width: 20px; height: 20px; border: 2px solid #e5e7eb; border-top: 2px solid #be185d; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 12px;"></div>
                <span id="status-text">Initializing collection...</span>
            </div>
            <div id="progress" style="font-size: 12px; color: #666;"></div>
        </div>
        
        <div id="results" style="display: none;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <h3 style="color: #166534; margin: 0 0 8px 0; font-size: 16px;">✅ Collection Complete!</h3>
                <div id="stats" style="font-size: 14px; color: #166534;"></div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #374151;">Comments for GiveawayHub:</label>
                <textarea id="comments-output" style="width: 100%; height: 200px; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-family: monospace; font-size: 12px; resize: vertical;" readonly></textarea>
            </div>
            
            <div style="display: flex; gap: 8px;">
                <button id="copy-btn" style="flex: 1; background: #be185d; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">📋 Copy Comments</button>
                <button id="download-btn" style="flex: 1; background: #059669; color: white; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">💾 Download JSON</button>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 16px;">
            <button id="close-btn" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close</button>
        </div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Collection logic
    let comments = [];
    let collectionStats = {};
    
    function updateStatus(text, progress = '') {
        document.getElementById('status-text').textContent = text;
        document.getElementById('progress').textContent = progress;
    }
    
    function collectComments() {
        updateStatus('Scanning page for comments...', 'This may take a few moments');
        
        setTimeout(() => {
            const commentSelectors = [
                'article ul li div div div span',
                'article div[role="button"] span',
                '[data-testid="comment"] span',
                'article section div div span'
            ];
            
            const seenComments = new Set();
            const rawComments = [];
            
            commentSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((el, index) => {
                    const text = el.textContent?.trim();
                    if (isValidComment(text)) {
                        const username = findUsername(el) || `user_${Date.now()}_${index}`;
                        const commentId = `${username.toLowerCase()}_${text.toLowerCase()}`;
                        
                        if (!seenComments.has(commentId)) {
                            seenComments.add(commentId);
                            rawComments.push({
                                username: username.replace('@', ''),
                                text: text,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                });
            });
            
            comments = rawComments.sort((a, b) => a.username.localeCompare(b.username));
            
            collectionStats = {
                totalComments: comments.length,
                uniqueUsers: new Set(comments.map(c => c.username.toLowerCase())).size,
                collectedAt: new Date().toISOString(),
                postUrl: window.location.href
            };
            
            showResults();
        }, 1000);
    }
    
    function isValidComment(text) {
        if (!text || text.length < 2) return false;
        
        const skipPatterns = [
            /^(Like|Reply|View replies|Translate|Show more|Hide)$/i,
            /^\\d+[smhd]$/,
            /^•$/,
            /^@\\w+$/,
            /^(liked by|and \\d+ others)$/i
        ];
        
        return !skipPatterns.some(pattern => pattern.test(text));
    }
    
    function findUsername(element) {
        let parent = element;
        for (let i = 0; i < 5; i++) {
            parent = parent.parentElement;
            if (!parent) break;
            
            const link = parent.querySelector('a[href*="/"]');
            if (link && link.href) {
                const href = link.href;
                if (!href.includes('/p/') && !href.includes('/reel/')) {
                    const username = href.split('/').filter(Boolean).pop();
                    if (username && username.length > 0) {
                        return username;
                    }
                }
            }
        }
        return null;
    }
    
    function showResults() {
        document.getElementById('status').style.display = 'none';
        document.getElementById('results').style.display = 'block';
        
        document.getElementById('stats').innerHTML = `
            📊 <strong>${collectionStats.totalComments}</strong> comments from <strong>${collectionStats.uniqueUsers}</strong> unique users
        `;
        
        const formattedComments = comments.map(c => `@${c.username}: ${c.text}`).join('\\n');
        document.getElementById('comments-output').value = formattedComments;
        
        // Copy button
        document.getElementById('copy-btn').onclick = () => {
            navigator.clipboard.writeText(formattedComments).then(() => {
                const btn = document.getElementById('copy-btn');
                const originalText = btn.textContent;
                btn.textContent = '✅ Copied!';
                btn.style.background = '#059669';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '#be185d';
                }, 2000);
            });
        };
        
        // Download button
        document.getElementById('download-btn').onclick = () => {
            const data = {
                collectionInfo: {
                    tool: 'GiveawayHub Bookmarklet',
                    version: '1.0.0'
                },
                stats: collectionStats,
                comments: comments
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `instagram-comments-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };
    }
    
    // Close button
    document.getElementById('close-btn').onclick = () => {
        document.body.removeChild(overlay);
    };
    
    // Start collection
    collectComments();
})();
"""
    
    # Minify and encode for bookmarklet
    minified = js_code.replace('\n', '').replace('    ', '').replace('  ', ' ')
    bookmarklet = f"javascript:{minified}"
    
    return bookmarklet

def create_bookmarklet_html():
    """Create HTML page with bookmarklet installation"""
    
    bookmarklet_code = generate_bookmarklet()
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GiveawayHub Instagram Comment Collector - Bookmarklet</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #be185d 0%, #ec4899 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 32px;
            margin-bottom: 8px;
        }}
        
        .header p {{
            font-size: 18px;
            opacity: 0.9;
        }}
        
        .content {{
            padding: 40px;
        }}
        
        .step {{
            margin-bottom: 32px;
            padding: 24px;
            background: #f9fafb;
            border-radius: 12px;
            border-left: 4px solid #be185d;
        }}
        
        .step h3 {{
            color: #be185d;
            margin-bottom: 12px;
            font-size: 20px;
        }}
        
        .step p {{
            color: #374151;
            line-height: 1.6;
            margin-bottom: 16px;
        }}
        
        .bookmarklet {{
            background: #1f2937;
            color: #10b981;
            padding: 16px;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            word-break: break-all;
            margin: 16px 0;
            border: 2px dashed #6b7280;
        }}
        
        .bookmarklet-button {{
            display: inline-block;
            background: linear-gradient(135deg, #be185d 0%, #ec4899 100%);
            color: white;
            padding: 16px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(190, 24, 93, 0.3);
            transition: all 0.3s ease;
        }}
        
        .bookmarklet-button:hover {{
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(190, 24, 93, 0.4);
        }}
        
        .warning {{
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 16px 0;
        }}
        
        .warning h4 {{
            color: #92400e;
            margin-bottom: 8px;
        }}
        
        .warning p {{
            color: #92400e;
            font-size: 14px;
        }}
        
        .features {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 32px 0;
        }}
        
        .feature {{
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }}
        
        .feature-icon {{
            font-size: 32px;
            margin-bottom: 12px;
        }}
        
        .feature h4 {{
            color: #be185d;
            margin-bottom: 8px;
        }}
        
        .feature p {{
            color: #6b7280;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Instagram Comment Collector</h1>
            <p>One-click bookmarklet for professional comment collection</p>
        </div>
        
        <div class="content">
            <div class="step">
                <h3>📋 Step 1: Install the Bookmarklet</h3>
                <p>Drag the button below to your bookmarks bar, or right-click and "Bookmark this link":</p>
                
                <div style="text-align: center; margin: 24px 0;">
                    <a href="{bookmarklet_code}" class="bookmarklet-button">
                        🚀 GiveawayHub Collector
                    </a>
                </div>
                
                <div class="warning">
                    <h4>⚠️ Important Notes:</h4>
                    <p>• Make sure your bookmarks bar is visible (Ctrl+Shift+B in Chrome)<br>
                    • Some browsers may require you to manually create the bookmark<br>
                    • The bookmarklet only works on Instagram post pages</p>
                </div>
            </div>
            
            <div class="step">
                <h3>🌐 Step 2: Navigate to Instagram</h3>
                <p>Go to any Instagram post that has comments you want to collect. Make sure:</p>
                <ul style="margin-left: 20px; color: #374151;">
                    <li>You're logged into Instagram</li>
                    <li>The post has visible comments</li>
                    <li>You're on a post URL (instagram.com/p/... or instagram.com/reel/...)</li>
                </ul>
            </div>
            
            <div class="step">
                <h3>🎯 Step 3: Collect Comments</h3>
                <p>Click the bookmarklet in your bookmarks bar. The collector will:</p>
                <ul style="margin-left: 20px; color: #374151;">
                    <li>Automatically scan the page for comments</li>
                    <li>Extract usernames and comment text</li>
                    <li>Remove duplicates and filter invalid entries</li>
                    <li>Format results for GiveawayHub import</li>
                </ul>
            </div>
            
            <div class="step">
                <h3>📊 Step 4: Use in GiveawayHub</h3>
                <p>Copy the collected comments and paste them into the GiveawayHub Instagram Comment Picker tool for advanced filtering and winner selection.</p>
            </div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <h4>Instant Collection</h4>
                    <p>One-click comment extraction from any Instagram post</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🔍</div>
                    <h4>Smart Filtering</h4>
                    <p>Automatically removes UI elements and duplicate comments</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">📋</div>
                    <h4>Easy Export</h4>
                    <p>Copy to clipboard or download as JSON for analysis</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🛡️</div>
                    <h4>Privacy Safe</h4>
                    <p>All processing happens locally in your browser</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 40px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280;">
                    Need more advanced features? Try our 
                    <a href="/tools/instagram-comment-picker" style="color: #be185d; text-decoration: none; font-weight: 600;">
                        Professional Instagram Comment Picker
                    </a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>"""
    
    return html_content

def main():
    """Generate bookmarklet files"""
    print("🚀 Generating Instagram Comment Collector Bookmarklet...")
    
    # Generate bookmarklet code
    bookmarklet = generate_bookmarklet()
    
    # Save bookmarklet code to file
    with open('instagram_bookmarklet.js', 'w', encoding='utf-8') as f:
        f.write(bookmarklet)
    
    # Generate HTML installation page
    html_content = create_bookmarklet_html()
    
    with open('bookmarklet_install.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("✅ Files generated:")
    print("   📄 instagram_bookmarklet.js - Raw bookmarklet code")
    print("   🌐 bookmarklet_install.html - Installation page")
    print()
    print("🎯 Next steps:")
    print("   1. Open bookmarklet_install.html in your browser")
    print("   2. Drag the bookmarklet button to your bookmarks bar")
    print("   3. Go to any Instagram post and click the bookmarklet")
    print("   4. Copy results and paste into GiveawayHub tool")

if __name__ == "__main__":
    main()