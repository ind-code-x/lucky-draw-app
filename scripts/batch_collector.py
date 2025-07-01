#!/usr/bin/env python3
"""
Batch Instagram Comment Collector
Collect comments from multiple Instagram posts
"""

import json
import time
import csv
from datetime import datetime
from instagram_collector import InstagramCommentCollector

class BatchInstagramCollector:
    def __init__(self, headless=True, delay_between_posts=30):
        self.headless = headless
        self.delay_between_posts = delay_between_posts
        self.results = []
    
    def collect_from_urls(self, urls, max_scrolls=20):
        """Collect comments from multiple URLs"""
        print(f"🚀 Starting batch collection from {len(urls)} posts")
        
        for i, url in enumerate(urls, 1):
            print(f"\n📍 Processing post {i}/{len(urls)}: {url}")
            
            try:
                collector = InstagramCommentCollector(headless=self.headless)
                result = collector.collect_from_url(url, max_scrolls=max_scrolls)
                
                if result['success']:
                    self.results.append({
                        'url': url,
                        'success': True,
                        'comments_count': len(result['comments']),
                        'post_info': result['post_info'],
                        'comments': result['comments'],
                        'collected_at': datetime.now().isoformat()
                    })
                    print(f"✅ Collected {len(result['comments'])} comments")
                else:
                    self.results.append({
                        'url': url,
                        'success': False,
                        'error': result['error'],
                        'collected_at': datetime.now().isoformat()
                    })
                    print(f"❌ Failed: {result['error']}")
                
            except Exception as e:
                print(f"❌ Unexpected error: {e}")
                self.results.append({
                    'url': url,
                    'success': False,
                    'error': str(e),
                    'collected_at': datetime.now().isoformat()
                })
            
            # Delay between posts to avoid rate limiting
            if i < len(urls):
                print(f"⏳ Waiting {self.delay_between_posts} seconds before next post...")
                time.sleep(self.delay_between_posts)
        
        return self.results
    
    def save_batch_results(self, filename=None):
        """Save batch results to JSON"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"batch_collection_{timestamp}.json"
        
        batch_data = {
            'collection_info': {
                'total_posts': len(self.results),
                'successful_posts': len([r for r in self.results if r['success']]),
                'total_comments': sum(r.get('comments_count', 0) for r in self.results),
                'collected_at': datetime.now().isoformat()
            },
            'results': self.results
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(batch_data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Batch results saved to: {filename}")
        return filename
    
    def export_to_csv(self, filename=None):
        """Export all comments to CSV"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"all_comments_{timestamp}.csv"
        
        all_comments = []
        for result in self.results:
            if result['success']:
                post_url = result['url']
                post_author = result['post_info'].get('author', 'unknown')
                
                for comment in result['comments']:
                    all_comments.append({
                        'post_url': post_url,
                        'post_author': post_author,
                        'comment_username': comment['username'],
                        'comment_text': comment['text'],
                        'comment_timestamp': comment['timestamp'],
                        'verified': comment.get('verified', False)
                    })
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            if all_comments:
                writer = csv.DictWriter(f, fieldnames=all_comments[0].keys())
                writer.writeheader()
                writer.writerows(all_comments)
        
        print(f"📊 CSV export saved to: {filename}")
        return filename

def main():
    # Example URLs - replace with actual Instagram post URLs
    urls = [
        "https://www.instagram.com/p/EXAMPLE1/",
        "https://www.instagram.com/p/EXAMPLE2/",
        "https://www.instagram.com/p/EXAMPLE3/",
    ]
    
    print("⚠️  Update the URLs list with actual Instagram post URLs")
    print("Current URLs are examples and will not work")
    
    # Uncomment below to run with real URLs
    # collector = BatchInstagramCollector(headless=False, delay_between_posts=60)
    # results = collector.collect_from_urls(urls, max_scrolls=15)
    # collector.save_batch_results()
    # collector.export_to_csv()

if __name__ == "__main__":
    main()