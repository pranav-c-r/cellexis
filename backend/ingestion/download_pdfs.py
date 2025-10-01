import os
import time
import requests
import csv
from pathlib import Path
from urllib.parse import urlparse
import json
from bs4 import BeautifulSoup

class PMCPDFDownloader:
    """Download PDFs from PubMed Central articles"""
    
    def __init__(self, output_dir="backend/data/papers"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
    def extract_pmc_id(self, url):
        """Extract PMC ID from URL"""
        # Handle both formats:
        # https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4136787/
        # https://pmc.ncbi.nlm.nih.gov/articles/PMC4136787/
        if 'PMC' in url:
            # Split by PMC and get the ID
            parts = url.split('PMC')
            if len(parts) > 1:
                pmc_id = parts[1].split('/')[0].split('?')[0]
                return f"PMC{pmc_id}"
        return None
    
    def get_pdf_url(self, article_url):
        """Fetch the actual PDF URL from the article page"""
        try:
            # Normalize URL to pmc.ncbi.nlm.nih.gov format
            if 'www.ncbi.nlm.nih.gov/pmc' in article_url:
                article_url = article_url.replace('www.ncbi.nlm.nih.gov/pmc', 'pmc.ncbi.nlm.nih.gov')
            
            # Fetch the HTML page
            response = self.session.get(article_url, timeout=15)
            if response.status_code != 200:
                return None
            
            # Parse HTML to find PDF link
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for PDF link - PMC uses different selectors
            # Try multiple methods to find the PDF link
            pdf_link = None
            
            # Method 1: Look for "Download PDF" link
            for link in soup.find_all('a', href=True):
                href = link.get('href', '')
                if '/pdf/' in href and href.endswith('.pdf'):
                    pdf_link = href
                    break
            
            # Method 2: Look in meta tags
            if not pdf_link:
                citation_pdf = soup.find('meta', {'name': 'citation_pdf_url'})
                if citation_pdf:
                    pdf_link = citation_pdf.get('content')
            
            # Method 3: Construct from PMC ID (fallback)
            if not pdf_link:
                pmc_id = self.extract_pmc_id(article_url)
                if pmc_id:
                    # Try common pattern
                    pdf_link = f"/articles/{pmc_id}/pdf/"
            
            if pdf_link:
                # Make absolute URL if relative
                if pdf_link.startswith('/'):
                    pdf_link = f"https://pmc.ncbi.nlm.nih.gov{pdf_link}"
                elif not pdf_link.startswith('http'):
                    pdf_link = f"https://pmc.ncbi.nlm.nih.gov/{pdf_link}"
                
                return pdf_link
            
            return None
            
        except Exception as e:
            print(f"Error fetching PDF URL: {e}")
            return None
    
    def download_pdf(self, article_url, filename=None):
        """Download a single PDF"""
        pmc_id = self.extract_pmc_id(article_url)
        if not pmc_id:
            print(f"Could not extract PMC ID from {article_url}")
            return False
        
        if not filename:
            filename = f"{pmc_id}.pdf"
        
        filepath = self.output_dir / filename
        
        # Skip if already downloaded
        if filepath.exists():
            print(f"✓ Already exists: {filename}")
            return True
        
        # Get the actual PDF URL
        pdf_url = self.get_pdf_url(article_url)
        if not pdf_url:
            print(f"✗ Could not find PDF link")
            return False
        
        try:
            print(f"Downloading {pmc_id}...", end=" ", flush=True)
            response = self.session.get(pdf_url, timeout=30, stream=True)
            
            if response.status_code == 200:
                # Check if it's actually a PDF
                content_type = response.headers.get('Content-Type', '')
                if 'pdf' not in content_type.lower() and 'application/octet-stream' not in content_type.lower():
                    print(f"✗ Not a PDF (Content-Type: {content_type})")
                    return False
                
                with open(filepath, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                file_size = filepath.stat().st_size
                if file_size < 1000:  # Less than 1KB is suspicious
                    print(f"✗ File too small ({file_size} bytes)")
                    filepath.unlink()  # Delete the file
                    return False
                
                print(f"✓ Success ({file_size / 1024:.1f} KB)")
                return True
            else:
                print(f"✗ Failed (Status {response.status_code})")
                return False
                
        except Exception as e:
            print(f"✗ Error: {str(e)}")
            return False
    
    def download_from_list(self, urls, delay=1):
        """Download PDFs from a list of URLs"""
        successful = 0
        failed = 0
        
        print(f"\nStarting download of {len(urls)} papers...")
        print(f"Output directory: {self.output_dir.absolute()}\n")
        
        for i, url in enumerate(urls, 1):
            print(f"[{i}/{len(urls)}] ", end="")
            
            if self.download_pdf(url.strip()):
                successful += 1
            else:
                failed += 1
            
            # Be polite to the server
            if i < len(urls):
                time.sleep(delay)
        
        print(f"\n{'='*60}")
        print(f"Download complete!")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        print(f"Total: {len(urls)}")
        print(f"{'='*60}")
        
        return successful, failed
    
    def download_from_file(self, filepath, delay=1):
        """Download PDFs from URLs in a text file (one URL per line)"""
        with open(filepath, 'r') as f:
            urls = [line.strip() for line in f if line.strip()]
        
        return self.download_from_list(urls, delay)
    
    def download_from_csv(self, filepath, url_column='pmc_url', delay=1):
        """Download PDFs from URLs in a CSV file"""
        urls = []
        
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if url_column in row and row[url_column].strip():
                    urls.append(row[url_column].strip())
        
        print(f"Found {len(urls)} URLs in CSV file")
        return self.download_from_list(urls, delay)
    
    def download_from_json(self, filepath, url_key='url', delay=1):
        """Download PDFs from URLs in a JSON file"""
        with open(filepath, 'r') as f:
            data = json.load(f)
        
        # Handle both list of URLs and list of objects with URL field
        if isinstance(data, list):
            if isinstance(data[0], str):
                urls = data
            else:
                urls = [item[url_key] for item in data if url_key in item]
        else:
            raise ValueError("JSON must contain a list")
        
        return self.download_from_list(urls, delay)


def main():
    """Example usage - configured for your metadata.csv file"""
    
    # Initialize downloader - PDFs will be saved to backend/data/papers/
    downloader = PMCPDFDownloader(output_dir="../data/papers")
    
    # Path to your metadata.csv file (in same directory as script)
    metadata_path = "metadata.csv"
    
    # Download all PDFs from metadata.csv
    print(f"Reading metadata from: {metadata_path}")
    successful, failed = downloader.download_from_csv(
        metadata_path, 
        url_column='pmc_url',  # Column name in your CSV
        delay=1  # 1 second between downloads
    )
    
    print(f"\n✓ Successfully downloaded: {successful} PDFs")
    if failed > 0:
        print(f"✗ Failed to download: {failed} PDFs")
    
    return successful, failed


if __name__ == "__main__":
    main()