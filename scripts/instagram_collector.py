#!/usr/bin/env python3
"""
Instagram Comment Collector using Selenium
Professional tool for automated comment extraction from Instagram posts
"""

import json
import time
import re
import sys
import argparse
from datetime import datetime
from urllib.parse import urlparse
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class InstagramCommentCollector:
    def __init__(self, headless=False, wait_time=10):
        self.wait_time = wait_time
        self.setup_driver(headless)
        self.comments = []
        self.post_info = {}
        
    def setup_driver(self, headless):
        """Setup Chrome WebDriver with optimal settings"""
        chrome_options = Options()
        
        if headless:
            chrome_options.add_argument("--headless")
        
        # Optimize for Instagram
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # User agent to avoid detection
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
    def validate_instagram_url(self, url):
        """Validate if URL is a valid Instagram post"""
        parsed = urlparse(url)
        if 'instagram.com' not in parsed.netloc:
            raise ValueError("URL must be from instagram.com")
        
        if not ('/p/' in url or '/reel/' in url):
            raise ValueError("URL must be an Instagram post or reel")
        
        return True
    
    def extract_post_id(self, url):
        """Extract post ID from Instagram URL"""
        match = re.search(r'/(?:p|reel)/([^/?]+)', url)
        return match.group(1) if match else None
    
    def get_post_info(self):
        """Extract post information"""
        try:
            # Get post author
            author_element = self.driver.find_element(By.CSS_SELECTOR, 'article header a')
            author = author_element.get_attribute('href').split('/')[-2] if author_element else 'unknown'
            
            # Get post caption
            try:
                caption_element = self.driver.find_element(By.CSS_SELECTOR, 'article div[data-testid="post-caption"] span')
                caption = caption_element.text if caption_element else ''
            except NoSuchElementException:
                caption = ''
            
            # Get like count (if visible)
            try:
                likes_element = self.driver.find_element(By.CSS_SELECTOR, 'article section div span')
                likes_text = likes_element.text
                likes = self.extract_number_from_text(likes_text)
            except NoSuchElementException:
                likes = 0
            
            self.post_info = {
                'author': author,
                'caption': caption,
                'likes': likes,
                'url': self.driver.current_url,
                'post_id': self.extract_post_id(self.driver.current_url),
                'collected_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Warning: Could not extract complete post info: {e}")
            self.post_info = {
                'url': self.driver.current_url,
                'post_id': self.extract_post_id(self.driver.current_url),
                'collected_at': datetime.now().isoformat()
            }
    
    def extract_number_from_text(self, text):
        """Extract number from text like '1,234 likes'"""
        if not text:
            return 0
        
        # Remove non-numeric characters except commas and dots
        cleaned = re.sub(r'[^\d,.]', '', text)
        if not cleaned:
            return 0
        
        try:
            # Handle different number formats
            if 'K' in text.upper():
                return int(float(cleaned) * 1000)
            elif 'M' in text.upper():
                return int(float(cleaned) * 1000000)
            else:
                return int(cleaned.replace(',', ''))
        except ValueError:
            return 0
    
    def wait_for_login(self):
        """Wait for user to login manually"""
        print("\n" + "="*60)
        print("🔐 MANUAL LOGIN REQUIRED")
        print("="*60)
        print("1. Please log in to your Instagram account")
        print("2. Navigate to the post if not already there")
        print("3. Make sure comments are visible")
        print("4. Press ENTER when ready to collect comments...")
        print("="*60)
        input()
        
        # Wait a bit for page to stabilize
        time.sleep(3)
    
    def scroll_to_load_comments(self, max_scrolls=20):
        """Scroll to load more comments"""
        print(f"📜 Loading comments (max {max_scrolls} scrolls)...")
        
        last_height = self.driver.execute_script("return document.body.scrollHeight")
        scrolls = 0
        
        while scrolls < max_scrolls:
            # Scroll down
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # Check if "Load more comments" button exists and click it
            try:
                load_more_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Load more comments') or contains(text(), 'View more comments')]")
                if load_more_btn.is_displayed():
                    load_more_btn.click()
                    time.sleep(3)
            except NoSuchElementException:
                pass
            
            # Check if new content loaded
            new_height = self.driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break
            
            last_height = new_height
            scrolls += 1
            
            if scrolls % 5 == 0:
                print(f"   Scrolled {scrolls} times...")
        
        print(f"✅ Finished loading comments after {scrolls} scrolls")
    
    def extract_comments(self):
        """Extract comments from the page"""
        print("🔍 Extracting comments...")
        
        # Multiple selectors for different Instagram layouts
        comment_selectors = [
            'article ul li div div div span',  # Main comment text
            'article div[role="button"] span',  # Alternative layout
            '[data-testid="comment"] span',     # New layout
            'article section div div span'      # Fallback
        ]
        
        seen_comments = set()
        raw_comments = []
        
        for selector in comment_selectors:
            try:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                print(f"   Found {len(elements)} elements with selector: {selector}")
                
                for element in elements:
                    text = element.text.strip()
                    if self.is_valid_comment_text(text):
                        raw_comments.append({
                            'text': text,
                            'element': element,
                            'selector': selector
                        })
            except Exception as e:
                print(f"   Error with selector {selector}: {e}")
        
        print(f"📊 Found {len(raw_comments)} potential comment elements")
        
        # Process and deduplicate comments
        processed_comments = []
        
        for comment_data in raw_comments:
            username = self.find_username_for_comment(comment_data['element'])
            text = comment_data['text']
            
            # Create unique identifier
            comment_id = f"{username.lower()}_{text.lower()}"
            
            if comment_id not in seen_comments and username and text:
                seen_comments.add(comment_id)
                processed_comments.append({
                    'username': username,
                    'text': text,
                    'timestamp': datetime.now().isoformat(),
                    'profile_url': f"https://instagram.com/{username}",
                    'verified': self.check_if_verified(comment_data['element'])
                })
        
        self.comments = processed_comments
        print(f"✅ Extracted {len(self.comments)} unique comments")
        
        return self.comments
    
    def is_valid_comment_text(self, text):
        """Check if text is a valid comment"""
        if not text or len(text) < 2:
            return False
        
        # Skip Instagram UI elements
        skip_patterns = [
            r'^(Like|Reply|View replies|Translate|Show more|Hide|Load more)$',
            r'^\d+[smhd]$',  # Time indicators like "2h", "1d"
            r'^•$',
            r'^@\w+$',  # Just username mentions
            r'^(liked by|and \d+ others)$',
            r'^\d+$',  # Just numbers
        ]
        
        for pattern in skip_patterns:
            if re.match(pattern, text, re.IGNORECASE):
                return False
        
        return True
    
    def find_username_for_comment(self, comment_element):
        """Find username associated with a comment element"""
        try:
            # Look for username in parent elements
            parent = comment_element
            for _ in range(5):  # Check up to 5 parent levels
                parent = parent.find_element(By.XPATH, '..')
                
                # Look for username link
                try:
                    username_link = parent.find_element(By.CSS_SELECTOR, 'a[href*="/"]')
                    href = username_link.get_attribute('href')
                    if '/p/' not in href and '/reel/' not in href:  # Not a post link
                        username = href.split('/')[-2] if href.endswith('/') else href.split('/')[-1]
                        if username and len(username) > 0 and not username.startswith('explore'):
                            return username.replace('@', '')
                except NoSuchElementException:
                    continue
            
            # Fallback: generate unique username
            return f"user_{int(time.time())}_{hash(comment_element.text) % 10000}"
            
        except Exception:
            return f"user_{int(time.time())}_{hash(comment_element.text) % 10000}"
    
    def check_if_verified(self, comment_element):
        """Check if the comment author is verified"""
        try:
            parent = comment_element
            for _ in range(5):
                parent = parent.find_element(By.XPATH, '..')
                verified_badge = parent.find_elements(By.CSS_SELECTOR, '[aria-label*="Verified"]')
                if verified_badge:
                    return True
            return False
        except Exception:
            return False
    
    def save_results(self, filename=None):
        """Save results to JSON file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            post_id = self.post_info.get('post_id', 'unknown')
            filename = f"instagram_comments_{post_id}_{timestamp}.json"
        
        results = {
            'post_info': self.post_info,
            'collection_stats': {
                'total_comments': len(self.comments),
                'unique_users': len(set(c['username'].lower() for c in self.comments)),
                'collection_time': datetime.now().isoformat()
            },
            'comments': self.comments
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Results saved to: {filename}")
        return filename
    
    def collect_from_url(self, url, auto_scroll=True, max_scrolls=20):
        """Main method to collect comments from Instagram URL"""
        try:
            print(f"🚀 Starting collection from: {url}")
            
            # Validate URL
            self.validate_instagram_url(url)
            
            # Navigate to URL
            self.driver.get(url)
            time.sleep(5)
            
            # Wait for manual login
            self.wait_for_login()
            
            # Extract post information
            self.get_post_info()
            print(f"📋 Post by: @{self.post_info.get('author', 'unknown')}")
            
            # Load comments
            if auto_scroll:
                self.scroll_to_load_comments(max_scrolls)
            
            # Extract comments
            comments = self.extract_comments()
            
            # Save results
            filename = self.save_results()
            
            print("\n" + "="*60)
            print("✅ COLLECTION COMPLETE!")
            print("="*60)
            print(f"📊 Total Comments: {len(comments)}")
            print(f"👥 Unique Users: {len(set(c['username'].lower() for c in comments))}")
            print(f"💾 Saved to: {filename}")
            print("="*60)
            
            return {
                'success': True,
                'comments': comments,
                'post_info': self.post_info,
                'filename': filename
            }
            
        except Exception as e:
            print(f"❌ Error during collection: {e}")
            return {
                'success': False,
                'error': str(e),
                'comments': self.comments
            }
        
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        if hasattr(self, 'driver'):
            self.driver.quit()

def main():
    parser = argparse.ArgumentParser(description='Instagram Comment Collector')
    parser.add_argument('url', help='Instagram post URL')
    parser.add_argument('--headless', action='store_true', help='Run in headless mode')
    parser.add_argument('--max-scrolls', type=int, default=20, help='Maximum number of scrolls')
    parser.add_argument('--output', help='Output filename')
    
    args = parser.parse_args()
    
    collector = InstagramCommentCollector(headless=args.headless)
    result = collector.collect_from_url(
        args.url, 
        max_scrolls=args.max_scrolls
    )
    
    if result['success']:
        print(f"\n🎉 Successfully collected {len(result['comments'])} comments!")
    else:
        print(f"\n❌ Collection failed: {result['error']}")
        sys.exit(1)

if __name__ == "__main__":
    main()