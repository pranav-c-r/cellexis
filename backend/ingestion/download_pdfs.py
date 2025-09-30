import pandas as pd
import requests
import os
import time

# Load metadata
df = pd.read_csv("metadata.csv")

# Create folder to store PDFs
pdf_folder = "pdfs"
os.makedirs(pdf_folder, exist_ok=True)

# Configuration
TIMEOUT = 30
MAX_RETRIES = 3
RETRY_DELAY = 2

# Function to convert PMC URL to PDF URL
def get_pdf_url(pmc_url):
    """Convert PMC article URL to PDF URL
    
    Examples:
    https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4136787/
    -> https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4136787/pdf/main.pdf
    
    OR (newer format):
    https://pmc.ncbi.nlm.nih.gov/articles/PMC4136787/
    -> https://pmc.ncbi.nlm.nih.gov/articles/PMC4136787/pdf/main.pdf
    """
    pmc_url = pmc_url.rstrip("/")
    
    # Extract PMC ID from URL
    # Works for both old (www.ncbi.nlm.nih.gov) and new (pmc.ncbi.nlm.nih.gov) formats
    if '/PMC' in pmc_url:
        pmc_id = pmc_url.split('/PMC')[1].split('/')[0]
        pmc_id = 'PMC' + pmc_id
        
        # Use the new PMC domain format
        return f"https://pmc.ncbi.nlm.nih.gov/articles/{pmc_id}/pdf/"
    
    # Fallback to old method if format doesn't match
    return pmc_url + "/pdf/"

def download_with_retry(pdf_url, pdf_path, paper_id, max_retries=MAX_RETRIES):
    """Download PDF with retry logic"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    for attempt in range(max_retries):
        try:
            r = requests.get(
                pdf_url, 
                stream=True, 
                timeout=TIMEOUT,
                headers=headers,
                allow_redirects=True
            )
            
            if r.status_code == 200:
                # Verify it's actually a PDF
                content_type = r.headers.get('content-type', '')
                if 'pdf' not in content_type.lower():
                    print(f"Warning: {paper_id} - unexpected content type: {content_type}")
                
                with open(pdf_path, "wb") as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                return True
            else:
                print(f"Failed to download {paper_id}: HTTP {r.status_code}")
                return False
                
        except requests.exceptions.Timeout:
            if attempt < max_retries - 1:
                print(f"Timeout for {paper_id}, retrying ({attempt + 1}/{max_retries})...")
                time.sleep(RETRY_DELAY)
            else:
                print(f"Failed to download {paper_id}: Timeout after {max_retries} attempts")
                return False
                
        except requests.exceptions.ConnectionError:
            if attempt < max_retries - 1:
                print(f"Connection error for {paper_id}, retrying ({attempt + 1}/{max_retries})...")
                time.sleep(RETRY_DELAY * (attempt + 1))  # Exponential backoff
            else:
                print(f"Failed to download {paper_id}: Connection error")
                return False
                
        except Exception as e:
            print(f"Error downloading {paper_id}: {e}")
            return False
    
    return False

# Track statistics
successful = 0
failed = 0
skipped = 0

# Download PDFs
total = len(df)
for idx, row in enumerate(df.head(5).iterrows(), 1):
    _, row = row  # Unpack the tuple
    paper_id = row['paper_id']
    pdf_path = os.path.join(pdf_folder, f"{paper_id}.pdf")
    
    # Print progress
    print(f"[{idx}/{total}] Processing paper {paper_id}...", end=" ")

    # Skip if already downloaded
    if os.path.exists(pdf_path):
        skipped += 1
        print("Skipped (already exists)")
        continue

    # Validate URL
    if not isinstance(row['pmc_url'], str) or not row['pmc_url'].startswith("https://"):
        print(f"Invalid URL")
        failed += 1
        continue

    # Get PDF URL and download
    pdf_url = get_pdf_url(row['pmc_url'])
    
    if download_with_retry(pdf_url, pdf_path, paper_id):
        successful += 1
        print("✓ Success")
    else:
        failed += 1
        print("✗ Failed")
    
    # Be respectful to NCBI servers
    time.sleep(0.5)

print("\n" + "="*50)
print("Download Summary:")
print(f"  Successful: {successful}")
print(f"  Failed: {failed}")
print(f"  Skipped (already exists): {skipped}")
print(f"  Total: {len(df)}")
print("="*50)