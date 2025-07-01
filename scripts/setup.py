#!/usr/bin/env python3
"""
Setup script for Instagram Comment Collector
"""

import os
import sys
import subprocess
import platform

def install_requirements():
    """Install Python requirements"""
    print("📦 Installing Python requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False
    return True

def install_chromedriver():
    """Install ChromeDriver automatically"""
    print("🔧 Setting up ChromeDriver...")
    try:
        from webdriver_manager.chrome import ChromeDriverManager
        from selenium import webdriver
        from selenium.webdriver.chrome.service import Service
        
        # Download and setup ChromeDriver
        driver_path = ChromeDriverManager().install()
        print(f"✅ ChromeDriver installed at: {driver_path}")
        
        # Test ChromeDriver
        service = Service(driver_path)
        options = webdriver.ChromeOptions()
        options.add_argument("--headless")
        driver = webdriver.Chrome(service=service, options=options)
        driver.get("https://www.google.com")
        driver.quit()
        print("✅ ChromeDriver test successful!")
        
    except Exception as e:
        print(f"❌ ChromeDriver setup failed: {e}")
        print("\n🔧 Manual ChromeDriver Installation:")
        print("1. Download ChromeDriver from: https://chromedriver.chromium.org/")
        print("2. Extract and add to your PATH")
        print("3. Or install via package manager:")
        
        if platform.system() == "Darwin":  # macOS
            print("   brew install chromedriver")
        elif platform.system() == "Linux":
            print("   sudo apt-get install chromium-chromedriver")
        elif platform.system() == "Windows":
            print("   Download from official site and add to PATH")
        
        return False
    return True

def create_example_script():
    """Create example usage script"""
    example_script = '''#!/usr/bin/env python3
"""
Example usage of Instagram Comment Collector
"""

from instagram_collector import InstagramCommentCollector

def main():
    # Example Instagram post URL
    url = "https://www.instagram.com/p/EXAMPLE_POST_ID/"
    
    # Create collector instance
    collector = InstagramCommentCollector(headless=False)
    
    # Collect comments
    result = collector.collect_from_url(url, max_scrolls=15)
    
    if result['success']:
        print(f"Collected {len(result['comments'])} comments!")
        
        # Print first few comments
        for i, comment in enumerate(result['comments'][:5]):
            print(f"{i+1}. @{comment['username']}: {comment['text']}")
    else:
        print(f"Collection failed: {result['error']}")

if __name__ == "__main__":
    main()
'''
    
    with open("example_usage.py", "w") as f:
        f.write(example_script)
    
    print("📝 Created example_usage.py")

def main():
    print("🚀 Instagram Comment Collector Setup")
    print("="*50)
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("❌ Python 3.7+ required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version.split()[0]} detected")
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Setup ChromeDriver
    if not install_chromedriver():
        print("⚠️  ChromeDriver setup failed, but you can install it manually")
    
    # Create example script
    create_example_script()
    
    print("\n" + "="*50)
    print("✅ Setup complete!")
    print("="*50)
    print("📖 Usage:")
    print("   python instagram_collector.py 'https://www.instagram.com/p/POST_ID/'")
    print("\n📝 Example:")
    print("   python example_usage.py")
    print("\n🔧 Options:")
    print("   --headless          Run without GUI")
    print("   --max-scrolls 30    Scroll more to load comments")
    print("   --output file.json  Custom output filename")

if __name__ == "__main__":
    main()