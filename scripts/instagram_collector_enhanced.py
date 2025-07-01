#!/usr/bin/env python3
"""
Enhanced Instagram Comment Collector using Selenium
Professional tool for automated comment extraction from Instagram posts
Works exactly like app-sorteos.com with advanced features
"""

import json
import time
import re
import sys
import argparse
import csv
from datetime import datetime
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains

class EnhancedInstagramCollector:
    def __init__(self, headless=False, wait_time=10, smart_scroll=True):
        self.wait_time = wait_time
        self.smart_scroll = smart_scroll
        self.setup_driver(headless)
        self.comments = []
        self.post_info = {}
        self.collection_stats = {}
        
    def setup_driver(self, headless):
        """Setup Chrome WebDriver with optimal settings for Instagram"""
        chrome_options = Options()
        
        if headless:
            chrome_options.add_argument("--headless")
        
        # Anti-detection measures
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Realistic user agent
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Performance optimizations
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-plugins")
        chrome_options.add_argument("--disable-images")  # Faster loading
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        self.driver.set_window_size(1920, 1080)
        
    def validate_instagram_url(self, url):
        """Validate if URL is a valid Instagram post"""
        parsed = urlparse(url)
        if 'instagram.com' not in parsed.netloc:
            raise ValueError("❌ URL must be from instagram.com")
        
        if not ('/p/' in url or '/reel/' in url):
            raise ValueError("❌ URL must be an Instagram post or reel")
        
        return True
    
    def extract_post_id(self, url):
        """Extract post ID from Instagram URL"""
        match = re.search(r'/(?:p|reel)/([^/?]+)', url)
        return match.group(1) if match else None
    
    def wait_for_login_and_navigation(self):
        """Enhanced login waiting with better UX"""
        print("\n" + "="*70)
        print("🔐 INSTAGRAM LOGIN REQUIRED")
        print("="*70)
        print("📋 INSTRUCTIONS:")
        print("1. 🔑 Log in to your Instagram account in the browser window")
        print("2. 🧭 Navigate to the post if not already there")
        print("3. 👀 Make sure comments are visible on the page")
        print("4. ⏳ Wait for all comments to load (scroll if needed)")
        print("5. ✅ Press ENTER when ready to start automatic collection")
        print("="*70)
        print("💡 TIP: For better results, scroll down manually to load more comments")
        print("="*70)
        
        input("Press ENTER when ready to collect comments...")
        
        # Wait for page stabilization
        time.sleep(3)
        
        # Verify we're on the right page
        current_url = self.driver.current_url
        if 'instagram.com' not in current_url:
            raise ValueError("❌ Please navigate to the Instagram post first")
        
        print("✅ Ready to collect comments!")
    
    def get_enhanced_post_info(self):
        """Extract comprehensive post information"""
        print("📊 Extracting post information...")
        
        try:
            # Get post author
            try:
                author_selectors = [
                    'article header a',
                    'header a[role="link"]',
                    'article a[role="link"]'
                ]
                author = None
                for selector in author_selectors:
                    try:
                        author_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                        href = author_element.get_attribute('href')
                        if href and '/p/' not in href and '/reel/' not in href:
                            author = href.split('/')[-2] if href.endswith('/') else href.split('/')[-1]
                            break
                    except NoSuchElementException:
                        continue
                
                if not author:
                    author = 'unknown'
                    
            except Exception:
                author = 'unknown'
            
            # Get post caption
            try:
                caption_selectors = [
                    'article div[data-testid="post-caption"] span',
                    'article div span[dir="auto"]',
                    'article div[role="button"] span'
                ]
                caption = ''
                for selector in caption_selectors:
                    try:
                        caption_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                        potential_caption = caption_element.text.strip()
                        if len(potential_caption) > len(caption):
                            caption = potential_caption
                    except NoSuchElementException:
                        continue
                        
            except Exception:
                caption = ''
            
            # Get engagement metrics
            try:
                # Likes
                likes_selectors = [
                    'article section div span',
                    'article button span',
                    '[aria-label*="like"]'
                ]
                likes = 0
                for selector in likes_selectors:
                    try:
                        elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                        for element in elements:
                            text = element.text.strip()
                            if 'like' in text.lower() and any(char.isdigit() for char in text):
                                likes = self.extract_number_from_text(text)
                                break
                        if likes > 0:
                            break
                    except Exception:
                        continue
                        
            except Exception:
                likes = 0
            
            # Get post type
            post_type = 'reel' if '/reel/' in self.driver.current_url else 'post'
            
            self.post_info = {
                'author': author,
                'caption': caption[:500] + '...' if len(caption) > 500 else caption,
                'likes': likes,
                'url': self.driver.current_url,
                'post_id': self.extract_post_id(self.driver.current_url),
                'post_type': post_type,
                'collected_at': datetime.now().isoformat(),
                'page_title': self.driver.title
            }
            
            print(f"✅ Post Info: @{author} | {post_type.title()} | {likes:,} likes")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not extract complete post info: {e}")
            self.post_info = {
                'url': self.driver.current_url,
                'post_id': self.extract_post_id(self.driver.current_url),
                'collected_at': datetime.now().isoformat(),
                'author': 'unknown',
                'post_type': 'unknown'
            }
    
    def extract_number_from_text(self, text):
        """Extract number from text like '1,234 likes' or '1.2K likes'"""
        if not text:
            return 0
        
        # Handle K, M suffixes
        text_upper = text.upper()
        multiplier = 1
        
        if 'K' in text_upper:
            multiplier = 1000
            text = text_upper.replace('K', '')
        elif 'M' in text_upper:
            multiplier = 1000000
            text = text_upper.replace('M', '')
        
        # Extract numbers
        numbers = re.findall(r'[\d,\.]+', text)
        if numbers:
            try:
                number = float(numbers[0].replace(',', ''))
                return int(number * multiplier)
            except ValueError:
                return 0
        
        return 0
    
    def smart_scroll_to_load_comments(self, max_scrolls=30, target_comments=None):
        """Intelligent scrolling to load comments efficiently"""
        print(f"🔄 Smart loading comments (max {max_scrolls} scrolls)...")
        
        if target_comments:
            print(f"🎯 Target: {target_comments} comments")
        
        last_comment_count = 0
        no_change_count = 0
        scrolls = 0
        
        while scrolls < max_scrolls:
            # Scroll down smoothly
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # Try to click "Load more comments" or "View more comments" buttons
            load_more_clicked = False
            load_more_selectors = [
                "//button[contains(text(), 'Load more comments')]",
                "//button[contains(text(), 'View more comments')]",
                "//span[contains(text(), 'Load more comments')]",
                "//span[contains(text(), 'View more comments')]"
            ]
            
            for selector in load_more_selectors:
                try:
                    load_more_btn = self.driver.find_element(By.XPATH, selector)
                    if load_more_btn.is_displayed() and load_more_btn.is_enabled():
                        self.driver.execute_script("arguments[0].click();", load_more_btn)
                        load_more_clicked = True
                        time.sleep(3)
                        print(f"   🔄 Clicked 'Load more comments' button")
                        break
                except NoSuchElementException:
                    continue
            
            # Count current comments
            current_comment_count = len(self.get_comment_elements())
            
            # Check progress
            if current_comment_count > last_comment_count:
                print(f"   📈 Progress: {current_comment_count} comments loaded")
                last_comment_count = current_comment_count
                no_change_count = 0
                
                # Check if we've reached target
                if target_comments and current_comment_count >= target_comments:
                    print(f"🎯 Target reached: {current_comment_count} comments")
                    break
            else:
                no_change_count += 1
                
                # If no new comments for several scrolls, try different approach
                if no_change_count >= 3:
                    if not load_more_clicked:
                        # Try scrolling to specific comment sections
                        try:
                            comment_section = self.driver.find_element(By.CSS_SELECTOR, 'article section')
                            self.driver.execute_script("arguments[0].scrollIntoView(true);", comment_section)
                            time.sleep(2)
                        except NoSuchElementException:
                            pass
                    
                    if no_change_count >= 5:
                        print(f"   ⏹️  No new comments loaded after {no_change_count} attempts")
                        break
            
            scrolls += 1
            
            if scrolls % 5 == 0:
                print(f"   📊 Scrolled {scrolls} times, {current_comment_count} comments found")
        
        final_count = len(self.get_comment_elements())
        print(f"✅ Finished loading: {final_count} comment elements found after {scrolls} scrolls")
        
        return final_count
    
    def get_comment_elements(self):
        """Get all potential comment elements"""
        comment_selectors = [
            'article ul li div div div span',
            'article div[role="button"] span',
            '[data-testid="comment"] span',
            'article section div div span',
            'article div span[dir="auto"]'
        ]
        
        all_elements = []
        for selector in comment_selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                all_elements.extend(elements)
            except Exception:
                continue
        
        return all_elements
    
    def extract_comments_enhanced(self):
        """Enhanced comment extraction with better accuracy"""
        print("🔍 Extracting comments with enhanced algorithm...")
        
        all_elements = self.get_comment_elements()
        print(f"   📊 Found {len(all_elements)} potential comment elements")
        
        seen_comments = set()
        processed_comments = []
        
        # Process elements
        for i, element in enumerate(all_elements):
            try:
                text = element.text.strip()
                
                if not self.is_valid_comment_text(text):
                    continue
                
                # Find username for this comment
                username = self.find_username_for_comment_enhanced(element)
                
                if not username or username == 'unknown':
                    username = f"user_{int(time.time())}_{i}"
                
                # Create unique identifier
                comment_id = f"{username.lower()}_{text.lower()}"
                
                if comment_id not in seen_comments and len(text) >= 2:
                    seen_comments.add(comment_id)
                    
                    comment_data = {
                        'username': username.replace('@', ''),
                        'text': text,
                        'timestamp': datetime.now().isoformat(),
                        'profile_url': f"https://instagram.com/{username.replace('@', '')}",
                        'verified': self.check_if_verified_enhanced(element),
                        'element_index': i,
                        'text_length': len(text)
                    }
                    
                    processed_comments.append(comment_data)
                    
            except Exception as e:
                continue
        
        # Sort by username for consistency
        processed_comments.sort(key=lambda x: x['username'].lower())
        
        self.comments = processed_comments
        
        # Update collection stats
        self.collection_stats = {
            'total_elements_found': len(all_elements),
            'valid_comments_extracted': len(processed_comments),
            'unique_users': len(set(c['username'].lower() for c in processed_comments)),
            'extraction_efficiency': len(processed_comments) / len(all_elements) if all_elements else 0,
            'average_comment_length': sum(c['text_length'] for c in processed_comments) / len(processed_comments) if processed_comments else 0
        }
        
        print(f"✅ Extracted {len(processed_comments)} unique comments from {len(set(c['username'].lower() for c in processed_comments))} users")
        print(f"   📊 Efficiency: {self.collection_stats['extraction_efficiency']:.1%}")
        
        return self.comments
    
    def is_valid_comment_text(self, text):
        """Enhanced validation for comment text"""
        if not text or len(text) < 1:
            return False
        
        # Skip Instagram UI elements and common non-comment text
        skip_patterns = [
            r'^(Like|Reply|View replies|Translate|Show more|Hide|Load more|See translation)$',
            r'^\d+[smhd]$',  # Time indicators
            r'^•$',
            r'^@\w+$',  # Just username mentions
            r'^(liked by|and \d+ others|View all \d+ comments)$',
            r'^\d+$',  # Just numbers
            r'^(Follow|Following|Verified)$',
            r'^(ago|hours?|days?|weeks?|months?)$',
            r'^(View profile|Message|Call)$'
        ]
        
        for pattern in skip_patterns:
            if re.match(pattern, text, re.IGNORECASE):
                return False
        
        # Must have some actual content
        if len(text.strip()) < 2:
            return False
        
        # Skip if it's just emojis or symbols
        if re.match(r'^[\W\s]*$', text):
            return False
        
        return True
    
    def find_username_for_comment_enhanced(self, comment_element):
        """Enhanced username finding with multiple strategies"""
        try:
            # Strategy 1: Look for username link in parent elements
            parent = comment_element
            for level in range(6):  # Check up to 6 parent levels
                try:
                    parent = parent.find_element(By.XPATH, '..')
                    
                    # Look for username links
                    username_selectors = [
                        'a[href*="/"][role="link"]',
                        'a[href*="/"]',
                        'span[dir="auto"] a',
                        'div a[href*="/"]'
                    ]
                    
                    for selector in username_selectors:
                        try:
                            username_links = parent.find_elements(By.CSS_SELECTOR, selector)
                            for link in username_links:
                                href = link.get_attribute('href')
                                if href and self.is_valid_username_link(href):
                                    username = self.extract_username_from_href(href)
                                    if username and len(username) > 0:
                                        return username
                        except Exception:
                            continue
                            
                except Exception:
                    break
            
            # Strategy 2: Look for username in nearby text elements
            try:
                parent = comment_element.find_element(By.XPATH, '../..')
                text_elements = parent.find_elements(By.CSS_SELECTOR, 'span, a')
                for elem in text_elements:
                    text = elem.text.strip()
                    if self.looks_like_username(text):
                        return text.replace('@', '')
            except Exception:
                pass
            
            # Strategy 3: Generate fallback username
            return f"user_{hash(comment_element.text) % 100000}"
            
        except Exception:
            return f"user_{int(time.time()) % 100000}"
    
    def is_valid_username_link(self, href):
        """Check if href is a valid username link"""
        if not href:
            return False
        
        # Exclude non-username links
        exclude_patterns = [
            '/p/', '/reel/', '/tv/', '/explore/', '/accounts/',
            '/direct/', '/stories/', '/live/', '/shop/',
            'facebook.com', 'twitter.com', 'youtube.com'
        ]
        
        for pattern in exclude_patterns:
            if pattern in href:
                return False
        
        return True
    
    def extract_username_from_href(self, href):
        """Extract username from href"""
        try:
            # Remove trailing slash and extract last part
            clean_href = href.rstrip('/')
            username = clean_href.split('/')[-1]
            
            # Validate username format
            if re.match(r'^[a-zA-Z0-9._]+$', username) and len(username) <= 30:
                return username
            
            return None
        except Exception:
            return None
    
    def looks_like_username(self, text):
        """Check if text looks like a username"""
        if not text or len(text) < 1:
            return False
        
        # Remove @ symbol
        clean_text = text.replace('@', '')
        
        # Check if it matches username pattern
        if re.match(r'^[a-zA-Z0-9._]+$', clean_text) and 1 <= len(clean_text) <= 30:
            return True
        
        return False
    
    def check_if_verified_enhanced(self, comment_element):
        """Enhanced verification check"""
        try:
            # Look for verification badge in parent elements
            parent = comment_element
            for _ in range(5):
                try:
                    parent = parent.find_element(By.XPATH, '..')
                    
                    # Look for verification indicators
                    verification_selectors = [
                        '[aria-label*="Verified"]',
                        '[title*="Verified"]',
                        'svg[aria-label*="Verified"]',
                        '.verified-badge'
                    ]
                    
                    for selector in verification_selectors:
                        if parent.find_elements(By.CSS_SELECTOR, selector):
                            return True
                            
                except Exception:
                    break
            
            return False
        except Exception:
            return False
    
    def save_enhanced_results(self, filename=None, format='json'):
        """Save results with multiple format options"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            post_id = self.post_info.get('post_id', 'unknown')
            filename = f"instagram_comments_{post_id}_{timestamp}"
        
        # Prepare comprehensive results
        results = {
            'collection_info': {
                'tool': 'GiveawayHub Instagram Collector',
                'version': '2.0.0',
                'collection_method': 'selenium_enhanced',
                'collected_at': datetime.now().isoformat()
            },
            'post_info': self.post_info,
            'collection_stats': self.collection_stats,
            'comments': self.comments,
            'summary': {
                'total_comments': len(self.comments),
                'unique_users': len(set(c['username'].lower() for c in self.comments)),
                'verified_users': len([c for c in self.comments if c.get('verified', False)]),
                'average_comment_length': self.collection_stats.get('average_comment_length', 0)
            }
        }
        
        saved_files = []
        
        # Save JSON (always)
        json_filename = f"{filename}.json"
        with open(json_filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        saved_files.append(json_filename)
        
        # Save TXT for GiveawayHub import
        txt_filename = f"{filename}_giveawayhub.txt"
        with open(txt_filename, 'w', encoding='utf-8') as f:
            for comment in self.comments:
                f.write(f"@{comment['username']}: {comment['text']}\n")
        saved_files.append(txt_filename)
        
        # Save CSV for analysis
        csv_filename = f"{filename}.csv"
        with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
            if self.comments:
                fieldnames = ['username', 'text', 'timestamp', 'verified', 'text_length', 'profile_url']
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                for comment in self.comments:
                    writer.writerow({
                        'username': comment['username'],
                        'text': comment['text'],
                        'timestamp': comment['timestamp'],
                        'verified': comment.get('verified', False),
                        'text_length': comment.get('text_length', len(comment['text'])),
                        'profile_url': comment.get('profile_url', '')
                    })
        saved_files.append(csv_filename)
        
        print(f"💾 Results saved to:")
        for file in saved_files:
            print(f"   📄 {file}")
        
        return saved_files
    
    def collect_from_url_enhanced(self, url, auto_scroll=True, max_scrolls=30, target_comments=None):
        """Enhanced main collection method"""
        start_time = time.time()
        
        try:
            print(f"🚀 Starting enhanced collection from: {url}")
            print(f"⚙️  Settings: auto_scroll={auto_scroll}, max_scrolls={max_scrolls}")
            
            # Validate URL
            self.validate_instagram_url(url)
            
            # Navigate to URL
            print("🌐 Navigating to Instagram post...")
            self.driver.get(url)
            time.sleep(5)
            
            # Wait for manual login and navigation
            self.wait_for_login_and_navigation()
            
            # Extract post information
            self.get_enhanced_post_info()
            
            # Load comments intelligently
            if auto_scroll:
                comment_count = self.smart_scroll_to_load_comments(max_scrolls, target_comments)
            else:
                comment_count = len(self.get_comment_elements())
                print(f"📊 Found {comment_count} comment elements (no auto-scroll)")
            
            # Extract comments
            comments = self.extract_comments_enhanced()
            
            # Calculate collection time
            collection_time = time.time() - start_time
            
            # Save results
            saved_files = self.save_enhanced_results()
            
            # Print comprehensive summary
            self.print_collection_summary(collection_time, saved_files)
            
            return {
                'success': True,
                'comments': comments,
                'post_info': self.post_info,
                'collection_stats': self.collection_stats,
                'saved_files': saved_files,
                'collection_time': collection_time
            }
            
        except Exception as e:
            print(f"❌ Error during collection: {e}")
            return {
                'success': False,
                'error': str(e),
                'comments': self.comments,
                'partial_results': len(self.comments) > 0
            }
        
        finally:
            self.cleanup()
    
    def print_collection_summary(self, collection_time, saved_files):
        """Print comprehensive collection summary"""
        print("\n" + "="*80)
        print("🎉 COLLECTION COMPLETE!")
        print("="*80)
        
        # Post information
        print(f"📋 POST INFORMATION:")
        print(f"   👤 Author: @{self.post_info.get('author', 'unknown')}")
        print(f"   🆔 Post ID: {self.post_info.get('post_id', 'unknown')}")
        print(f"   📱 Type: {self.post_info.get('post_type', 'unknown').title()}")
        print(f"   ❤️  Likes: {self.post_info.get('likes', 0):,}")
        
        # Collection statistics
        print(f"\n📊 COLLECTION STATISTICS:")
        print(f"   💬 Total Comments: {len(self.comments):,}")
        print(f"   👥 Unique Users: {len(set(c['username'].lower() for c in self.comments)):,}")
        print(f"   ✅ Verified Users: {len([c for c in self.comments if c.get('verified', False)]):,}")
        print(f"   📏 Avg Comment Length: {self.collection_stats.get('average_comment_length', 0):.1f} chars")
        print(f"   ⚡ Efficiency: {self.collection_stats.get('extraction_efficiency', 0):.1%}")
        print(f"   ⏱️  Collection Time: {collection_time:.1f} seconds")
        
        # File information
        print(f"\n💾 SAVED FILES:")
        for file in saved_files:
            print(f"   📄 {file}")
        
        print(f"\n🎯 NEXT STEPS:")
        print(f"   1. 📋 Copy content from *_giveawayhub.txt file")
        print(f"   2. 🌐 Go to GiveawayHub Instagram Comment Picker")
        print(f"   3. 📝 Paste into manual import section")
        print(f"   4. 🎲 Use advanced filtering and winner selection")
        
        print("="*80)
    
    def cleanup(self):
        """Clean up resources"""
        try:
            if hasattr(self, 'driver'):
                self.driver.quit()
                print("🧹 Browser closed successfully")
        except Exception:
            pass

def main():
    parser = argparse.ArgumentParser(
        description='Enhanced Instagram Comment Collector - Works like app-sorteos.com',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python instagram_collector_enhanced.py "https://www.instagram.com/p/ABC123/"
  python instagram_collector_enhanced.py "https://www.instagram.com/p/ABC123/" --headless --max-scrolls 50
  python instagram_collector_enhanced.py "https://www.instagram.com/p/ABC123/" --target-comments 500
        """
    )
    
    parser.add_argument('url', help='Instagram post or reel URL')
    parser.add_argument('--headless', action='store_true', help='Run in headless mode (no browser window)')
    parser.add_argument('--max-scrolls', type=int, default=30, help='Maximum number of scrolls (default: 30)')
    parser.add_argument('--target-comments', type=int, help='Stop when target number of comments reached')
    parser.add_argument('--no-auto-scroll', action='store_true', help='Disable automatic scrolling')
    parser.add_argument('--output', help='Output filename prefix (without extension)')
    
    args = parser.parse_args()
    
    print("🚀 GiveawayHub Instagram Comment Collector v2.0")
    print("   Professional tool for automated comment extraction")
    print("   Works exactly like app-sorteos.com with enhanced features")
    print()
    
    collector = EnhancedInstagramCollector(
        headless=args.headless,
        smart_scroll=True
    )
    
    result = collector.collect_from_url_enhanced(
        args.url,
        auto_scroll=not args.no_auto_scroll,
        max_scrolls=args.max_scrolls,
        target_comments=args.target_comments
    )
    
    if result['success']:
        print(f"\n🎉 SUCCESS! Collected {len(result['comments'])} comments in {result['collection_time']:.1f}s")
        if result.get('saved_files'):
            print(f"📁 Files saved: {', '.join(result['saved_files'])}")
    else:
        print(f"\n❌ COLLECTION FAILED: {result['error']}")
        if result.get('partial_results'):
            print(f"⚠️  Partial results: {len(result['comments'])} comments collected")
        sys.exit(1)

if __name__ == "__main__":
    main()