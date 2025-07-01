#!/usr/bin/env python3
"""
Enhanced Setup script for Instagram Comment Collector
Comprehensive installation and configuration
"""

import os
import sys
import subprocess
import platform
import json
from pathlib import Path

def print_header():
    """Print setup header"""
    print("🚀 GiveawayHub Instagram Comment Collector Setup")
    print("="*60)
    print("Professional tool for automated Instagram comment collection")
    print("Works exactly like app-sorteos.com with enhanced features")
    print("="*60)

def check_python_version():
    """Check Python version"""
    print("🐍 Checking Python version...")
    
    if sys.version_info < (3, 7):
        print("❌ Python 3.7+ required")
        print(f"   Current version: {sys.version}")
        print("   Please upgrade Python and try again")
        return False
    
    print(f"✅ Python {sys.version.split()[0]} detected")
    return True

def install_requirements():
    """Install Python requirements"""
    print("\n📦 Installing Python requirements...")
    
    try:
        # Check if pip is available
        subprocess.check_call([sys.executable, "-m", "pip", "--version"], 
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        print("❌ pip not found. Please install pip first.")
        return False
    
    try:
        # Install requirements
        print("   Installing packages...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements_enhanced.txt"
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        print("✅ Requirements installed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        print("   Try running: pip install -r requirements_enhanced.txt")
        return False

def setup_chromedriver():
    """Setup ChromeDriver automatically"""
    print("\n🔧 Setting up ChromeDriver...")
    
    try:
        # Try to import and use webdriver-manager
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        from selenium.webdriver.chrome.options import Options
        
        print("   Downloading ChromeDriver...")
        driver_path = ChromeDriverManager().install()
        print(f"   ChromeDriver installed at: {driver_path}")
        
        # Test ChromeDriver
        print("   Testing ChromeDriver...")
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        
        service = Service(driver_path)
        driver = webdriver.Chrome(service=service, options=options)
        driver.get("https://www.google.com")
        driver.quit()
        
        print("✅ ChromeDriver test successful!")
        return True
        
    except Exception as e:
        print(f"❌ ChromeDriver setup failed: {e}")
        print("\n🔧 Manual ChromeDriver Installation:")
        print("1. Download ChromeDriver from: https://chromedriver.chromium.org/")
        print("2. Extract and add to your PATH")
        print("3. Or install via package manager:")
        
        system = platform.system()
        if system == "Darwin":  # macOS
            print("   brew install chromedriver")
        elif system == "Linux":
            print("   sudo apt-get install chromium-chromedriver")
        elif system == "Windows":
            print("   Download from official site and add to PATH")
        
        return False

def create_config_file():
    """Create configuration file"""
    print("\n⚙️  Creating configuration file...")
    
    config = {
        "default_settings": {
            "headless": False,
            "max_scrolls": 30,
            "wait_time": 10,
            "smart_scroll": True
        },
        "output_formats": {
            "json": True,
            "csv": True,
            "txt_giveawayhub": True
        },
        "collection_settings": {
            "remove_duplicates": True,
            "filter_ui_elements": True,
            "extract_verified_status": True,
            "include_timestamps": True
        }
    }
    
    with open("config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    print("✅ Configuration file created: config.json")

def create_example_scripts():
    """Create example usage scripts"""
    print("\n📝 Creating example scripts...")
    
    # Basic example
    basic_example = '''#!/usr/bin/env python3
"""
Basic Instagram Comment Collection Example
"""

from instagram_collector_enhanced import EnhancedInstagramCollector

def main():
    # Example Instagram post URL
    url = "https://www.instagram.com/p/EXAMPLE_POST_ID/"
    
    print("🚀 GiveawayHub Instagram Comment Collector")
    print("="*50)
    
    # Create collector instance
    collector = EnhancedInstagramCollector(headless=False)
    
    # Collect comments
    result = collector.collect_from_url_enhanced(url, max_scrolls=20)
    
    if result['success']:
        comments = result['comments']
        print(f"\\n🎉 Success! Collected {len(comments)} comments")
        print(f"👥 From {len(set(c['username'].lower() for c in comments))} unique users")
        
        # Show first few comments
        print("\\n📝 Sample comments:")
        for i, comment in enumerate(comments[:5]):
            print(f"  {i+1}. @{comment['username']}: {comment['text'][:50]}...")
        
        print(f"\\n💾 Files saved: {', '.join(result['saved_files'])}")
        print("\\n🎯 Next: Copy *_giveawayhub.txt content to GiveawayHub tool!")
        
    else:
        print(f"\\n❌ Collection failed: {result['error']}")

if __name__ == "__main__":
    main()
'''
    
    with open("example_basic.py", "w") as f:
        f.write(basic_example)
    
    # Advanced example
    advanced_example = '''#!/usr/bin/env python3
"""
Advanced Instagram Comment Collection with Custom Processing
"""

from instagram_collector_enhanced import EnhancedInstagramCollector
import json
import re

def filter_giveaway_comments(comments):
    """Filter comments that look like giveaway entries"""
    giveaway_comments = []
    
    for comment in comments:
        text = comment['text'].lower()
        
        # Look for giveaway indicators
        giveaway_keywords = ['@', 'tag', 'friend', 'follow', 'enter', 'win', 'giveaway']
        
        if any(keyword in text for keyword in giveaway_keywords):
            # Count @mentions
            mentions = len(re.findall(r'@\\w+', comment['text']))
            comment['mention_count'] = mentions
            giveaway_comments.append(comment)
    
    return giveaway_comments

def main():
    url = input("Enter Instagram post URL: ").strip()
    
    if not url:
        print("❌ Please provide a valid Instagram URL")
        return
    
    print("\\n🚀 Advanced Instagram Comment Collection")
    print("="*50)
    
    # Create collector with custom settings
    collector = EnhancedInstagramCollector(
        headless=False,
        smart_scroll=True
    )
    
    # Collect comments
    result = collector.collect_from_url_enhanced(
        url, 
        max_scrolls=50,  # More scrolls for larger giveaways
        target_comments=1000  # Stop at 1000 comments
    )
    
    if result['success']:
        all_comments = result['comments']
        
        # Filter for giveaway entries
        giveaway_entries = filter_giveaway_comments(all_comments)
        
        print(f"\\n📊 Collection Results:")
        print(f"   Total comments: {len(all_comments)}")
        print(f"   Giveaway entries: {len(giveaway_entries)}")
        print(f"   Unique participants: {len(set(c['username'].lower() for c in giveaway_entries))}")
        
        # Save filtered results
        filtered_data = {
            'original_stats': result['collection_stats'],
            'filtered_stats': {
                'total_giveaway_entries': len(giveaway_entries),
                'unique_participants': len(set(c['username'].lower() for c in giveaway_entries))
            },
            'giveaway_entries': giveaway_entries
        }
        
        with open('filtered_giveaway_entries.json', 'w', encoding='utf-8') as f:
            json.dump(filtered_data, f, indent=2, ensure_ascii=False)
        
        # Create GiveawayHub format
        with open('giveaway_entries_for_giveawayhub.txt', 'w', encoding='utf-8') as f:
            for entry in giveaway_entries:
                f.write(f"@{entry['username']}: {entry['text']}\\n")
        
        print(f"\\n💾 Filtered results saved:")
        print(f"   📄 filtered_giveaway_entries.json")
        print(f"   📄 giveaway_entries_for_giveawayhub.txt")
        
        print(f"\\n🎯 Ready for GiveawayHub winner selection!")
        
    else:
        print(f"\\n❌ Collection failed: {result['error']}")

if __name__ == "__main__":
    main()
'''
    
    with open("example_advanced.py", "w") as f:
        f.write(advanced_example)
    
    print("✅ Example scripts created:")
    print("   📄 example_basic.py - Simple usage example")
    print("   📄 example_advanced.py - Advanced filtering example")

def create_batch_script():
    """Create batch processing script"""
    print("\n📦 Creating batch processing script...")
    
    batch_script = '''#!/usr/bin/env python3
"""
Batch Instagram Comment Collection
Process multiple posts automatically
"""

from instagram_collector_enhanced import EnhancedInstagramCollector
import json
import time
from datetime import datetime

def collect_from_multiple_urls(urls, delay_between_posts=60):
    """Collect comments from multiple Instagram posts"""
    
    print(f"🚀 Starting batch collection from {len(urls)} posts")
    print(f"⏱️  Delay between posts: {delay_between_posts} seconds")
    print("="*60)
    
    results = []
    
    for i, url in enumerate(urls, 1):
        print(f"\\n📍 Processing post {i}/{len(urls)}")
        print(f"🔗 URL: {url}")
        
        try:
            collector = EnhancedInstagramCollector(headless=True)  # Headless for batch
            result = collector.collect_from_url_enhanced(
                url, 
                max_scrolls=25,
                auto_scroll=True
            )
            
            if result['success']:
                results.append({
                    'url': url,
                    'success': True,
                    'comments_count': len(result['comments']),
                    'unique_users': len(set(c['username'].lower() for c in result['comments'])),
                    'collection_time': result['collection_time'],
                    'comments': result['comments'],
                    'post_info': result['post_info']
                })
                
                print(f"✅ Success: {len(result['comments'])} comments collected")
                
            else:
                results.append({
                    'url': url,
                    'success': False,
                    'error': result['error']
                })
                print(f"❌ Failed: {result['error']}")
                
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            results.append({
                'url': url,
                'success': False,
                'error': str(e)
            })
        
        # Delay between posts
        if i < len(urls):
            print(f"⏳ Waiting {delay_between_posts} seconds...")
            time.sleep(delay_between_posts)
    
    # Save batch results
    batch_data = {
        'batch_info': {
            'total_posts': len(urls),
            'successful_posts': len([r for r in results if r['success']]),
            'total_comments': sum(r.get('comments_count', 0) for r in results),
            'total_unique_users': len(set(
                username.lower() 
                for r in results if r['success'] 
                for comment in r['comments'] 
                for username in [comment['username']]
            )),
            'processed_at': datetime.now().isoformat()
        },
        'results': results
    }
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"batch_collection_{timestamp}.json"
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(batch_data, f, indent=2, ensure_ascii=False)
    
    # Create combined GiveawayHub file
    giveawayhub_filename = f"batch_giveawayhub_{timestamp}.txt"
    with open(giveawayhub_filename, 'w', encoding='utf-8') as f:
        for result in results:
            if result['success']:
                f.write(f"\\n# Comments from: {result['url']}\\n")
                for comment in result['comments']:
                    f.write(f"@{comment['username']}: {comment['text']}\\n")
    
    print(f"\\n" + "="*60)
    print(f"🎉 BATCH COLLECTION COMPLETE!")
    print(f"="*60)
    print(f"📊 Results:")
    print(f"   Total posts processed: {batch_data['batch_info']['total_posts']}")
    print(f"   Successful collections: {batch_data['batch_info']['successful_posts']}")
    print(f"   Total comments: {batch_data['batch_info']['total_comments']:,}")
    print(f"   Unique users: {batch_data['batch_info']['total_unique_users']:,}")
    print(f"\\n💾 Files saved:")
    print(f"   📄 {filename} - Complete batch data")
    print(f"   📄 {giveawayhub_filename} - Combined comments for GiveawayHub")
    
    return results

def main():
    # Example URLs - replace with actual Instagram post URLs
    urls = [
        "https://www.instagram.com/p/EXAMPLE1/",
        "https://www.instagram.com/p/EXAMPLE2/",
        "https://www.instagram.com/p/EXAMPLE3/",
    ]
    
    print("⚠️  Please update the URLs list with actual Instagram post URLs")
    print("Current URLs are examples and will not work\\n")
    
    # Uncomment and modify for actual use:
    # urls = input("Enter Instagram URLs (one per line, press Enter twice when done):\\n").strip().split('\\n')
    # urls = [url.strip() for url in urls if url.strip()]
    
    # collect_from_multiple_urls(urls, delay_between_posts=90)

if __name__ == "__main__":
    main()
'''
    
    with open("batch_collector_enhanced.py", "w") as f:
        f.write(batch_script)
    
    print("✅ Batch processing script created: batch_collector_enhanced.py")

def run_tests():
    """Run basic tests to verify installation"""
    print("\n🧪 Running installation tests...")
    
    try:
        # Test imports
        print("   Testing imports...")
        import selenium
        from selenium import webdriver
        from selenium.webdriver.chrome.options import Options
        print("   ✅ Selenium import successful")
        
        # Test webdriver-manager
        from webdriver_manager.chrome import ChromeDriverManager
        print("   ✅ WebDriver Manager import successful")
        
        # Test other dependencies
        import requests
        import pandas
        print("   ✅ Additional dependencies imported")
        
        print("✅ All tests passed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import test failed: {e}")
        return False

def print_usage_instructions():
    """Print usage instructions"""
    print("\n" + "="*60)
    print("✅ SETUP COMPLETE!")
    print("="*60)
    
    print("\n🎯 Quick Start:")
    print("   1. Update example URLs in the scripts")
    print("   2. Run: python example_basic.py")
    print("   3. Follow the browser login prompts")
    print("   4. Copy results to GiveawayHub tool")
    
    print("\n📖 Available Scripts:")
    print("   📄 instagram_collector_enhanced.py - Main collector")
    print("   📄 example_basic.py - Simple usage example")
    print("   📄 example_advanced.py - Advanced filtering")
    print("   📄 batch_collector_enhanced.py - Multiple posts")
    
    print("\n🔧 Command Line Usage:")
    print('   python instagram_collector_enhanced.py "https://www.instagram.com/p/POST_ID/"')
    print('   python instagram_collector_enhanced.py "URL" --headless --max-scrolls 50')
    
    print("\n⚙️  Configuration:")
    print("   📄 config.json - Modify default settings")
    print("   📄 requirements_enhanced.txt - Python dependencies")
    
    print("\n🆘 Troubleshooting:")
    print("   • Make sure Chrome browser is installed")
    print("   • Check that you're logged into Instagram")
    print("   • Try running with --headless flag if GUI issues")
    print("   • Increase --max-scrolls for posts with many comments")
    
    print("\n🌐 Integration with GiveawayHub:")
    print("   1. Run the collector script")
    print("   2. Copy content from *_giveawayhub.txt file")
    print("   3. Paste into GiveawayHub manual import")
    print("   4. Use advanced filtering and winner selection")
    
    print("="*60)

def main():
    """Main setup function"""
    print_header()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        print("⚠️  Some requirements failed to install. You may need to install them manually.")
    
    # Setup ChromeDriver
    if not setup_chromedriver():
        print("⚠️  ChromeDriver setup failed. You may need to install it manually.")
    
    # Create configuration and examples
    create_config_file()
    create_example_scripts()
    create_batch_script()
    
    # Run tests
    if not run_tests():
        print("⚠️  Some tests failed. Check your installation.")
    
    # Print usage instructions
    print_usage_instructions()

if __name__ == "__main__":
    main()