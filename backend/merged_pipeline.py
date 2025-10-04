import pdfplumber
import re
import json
import os
from collections import Counter
from pathlib import Path

try:
    import wordninja
    WORDNINJA_AVAILABLE = True
except ImportError:
    WORDNINJA_AVAILABLE = False
    print("⚠ WordNinja not installed. Run: pip install wordninja")


class PDFToChunksPipeline:
    """
    Unified pipeline: PDF → Clean Text → Chunks → JSONL
    No intermediate text files created
    """
    
    def __init__(self, pdf_directory, output_directory, max_pdfs=100):
        """
        Args:
            pdf_directory: Path to folder containing PDFs
            output_directory: Path to save output JSONL files
            max_pdfs: Maximum number of PDFs to process (for scaling)
        """
        self.pdf_directory = Path(pdf_directory)
        self.output_directory = Path(output_directory)
        self.max_pdfs = max_pdfs
        self.output_directory.mkdir(parents=True, exist_ok=True)
        
        self.page_patterns = {
            'headers': [],
            'footers': [],
            'page_numbers': []
        }
    
    # ==================== TEXT EXTRACTION METHODS ====================
    
    def analyze_document(self, pdf):
        """Analyze the document to find repeated headers/footers across pages"""
        top_lines = []
        bottom_lines = []
        
        for page in pdf.pages[:min(10, len(pdf.pages))]:
            words = page.extract_words()
            if not words:
                continue
            
            lines_dict = {}
            for word in words:
                y = round(word['top'])
                if y not in lines_dict:
                    lines_dict[y] = []
                lines_dict[y].append(word['text'])
            
            sorted_lines = [' '.join(lines_dict[y]) for y in sorted(lines_dict.keys())]
            
            if len(sorted_lines) >= 2:
                top_lines.append(sorted_lines[0].strip())
                bottom_lines.append(sorted_lines[-1].strip())
        
        if top_lines:
            top_counter = Counter(top_lines)
            threshold = len(top_lines) * 0.4
            self.page_patterns['headers'] = [line for line, count in top_counter.items() if count > threshold]
        
        if bottom_lines:
            bottom_counter = Counter(bottom_lines)
            threshold = len(bottom_lines) * 0.4
            self.page_patterns['footers'] = [line for line, count in bottom_counter.items() if count > threshold]
    
    def is_page_number(self, line):
        """Check if a line is likely a page number"""
        line = line.strip()
        if re.fullmatch(r'\d+', line):
            return True
        if re.fullmatch(r'(?:page\s*)?\d+(?:\s*of\s*\d+)?', line, re.IGNORECASE):
            return True
        if re.fullmatch(r'[ivxlcdm]+', line, re.IGNORECASE):
            return True
        return False
    
    def is_likely_header_footer(self, line):
        """Check if line matches common header/footer patterns"""
        line = line.strip()
        
        if line in self.page_patterns['headers'] or line in self.page_patterns['footers']:
            return True
        
        if re.search(r'(https?://|www\.|doi:|©|®|™)', line, re.IGNORECASE):
            return True
        
        if re.search(r'(published|journal|copyright|rights reserved|downloaded from)', line, re.IGNORECASE):
            return True
        
        return False
    
    def is_reference_section(self, line):
        """Detect if we're in the references section"""
        ref_indicators = [
            r'^\s*references\s*$',
            r'^\s*bibliography\s*$',
            r'^\s*works cited\s*$',
            r'^\s*literature cited\s*$'
        ]
        return any(re.match(pattern, line, re.IGNORECASE) for pattern in ref_indicators)
    
    def is_likely_noise(self, line):
        """Check if line is noise (non-content)"""
        line = line.strip()
        
        if len(line) < 8:
            return True
        
        special_char_ratio = sum(1 for c in line if not c.isalnum() and not c.isspace()) / len(line)
        if special_char_ratio > 0.7:
            return True
        
        if re.search(r'(.)\1{5,}', line):
            return True
        
        if re.fullmatch(r'[\d\s\.\,\-\–\—]+', line):
            return True
        
        return False
    
    def calculate_text_density(self, line):
        """Calculate how 'text-like' a line is"""
        if not line:
            return 0
        alpha_chars = sum(1 for c in line if c.isalpha())
        return alpha_chars / len(line)
    
    def extract_text_with_spacing(self, page):
        """ULTRA-AGGRESSIVE spacing with proper line preservation"""
        words = page.extract_words()
        if not words:
            return ""
        
        lines_dict = {}
        for word in words:
            y = round(word['top'] / 3) * 3
            if y not in lines_dict:
                lines_dict[y] = []
            lines_dict[y].append({
                'text': word['text'],
                'x0': word['x0'],
                'x1': word['x1'],
                'top': word['top']
            })
        
        sorted_y = sorted(lines_dict.keys())
        page_lines = []
        
        for y in sorted_y:
            line_words = sorted(lines_dict[y], key=lambda w: w['x0'])
            
            line_text = ""
            
            for i, word in enumerate(line_words):
                word_text = word['text'].strip()
                if not word_text:
                    continue
                
                if line_text:
                    line_text += " " + word_text
                else:
                    line_text = word_text
            
            page_lines.append(line_text.strip())
        
        return '\n'.join(page_lines)
    
    def clean_page_text(self, page_text, page_num, total_pages):
        """Clean a single page's text intelligently"""
        lines = page_text.split('\n')
        lines = [l.strip() for l in lines if l.strip()]
        
        cleaned_lines = []
        in_references = False
        
        for i, line in enumerate(lines):
            if self.is_reference_section(line):
                in_references = True
                continue
            
            if in_references:
                continue
            
            if self.is_page_number(line):
                continue
            
            if self.is_likely_header_footer(line):
                continue
            
            if self.is_likely_noise(line):
                continue
            
            if self.calculate_text_density(line) < 0.2:
                continue
            
            if page_num == 1 and i == 0:
                continue
            
            cleaned_lines.append(line)
        
        return cleaned_lines
    
    def simple_paragraph_reconstruction(self, lines):
        """SIMPLE and RELIABLE paragraph reconstruction"""
        if not lines:
            return []
        
        paragraphs = []
        current_paragraph = []
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_paragraph:
                    paragraphs.append(' '.join(current_paragraph))
                    current_paragraph = []
                continue
            
            is_new_paragraph = (
                not current_paragraph or
                len(line) < 50 or
                line[0].isupper() and not current_paragraph[-1].endswith(('.', '!', '?')) or
                any(line.lower().startswith(keyword) for keyword in [
                    'introduction', 'methods', 'results', 'discussion', 'conclusion', 
                    'abstract', 'background', 'objective', 'aim', 'purpose'
                ])
            )
            
            if is_new_paragraph and current_paragraph:
                paragraphs.append(' '.join(current_paragraph))
                current_paragraph = [line]
            else:
                current_paragraph.append(line)
        
        if current_paragraph:
            paragraphs.append(' '.join(current_paragraph))
        
        return paragraphs
    
    def merge_hyphenated_words(self, text):
        """Fix words broken across lines with hyphens"""
        text = re.sub(r'(\w+)-\s+\n\s*(\w+)', r'\1\2', text)
        text = re.sub(r'(\w+)-\s+(\w+)', r'\1\2', text)
        return text
    
    def ultra_aggressive_space_fix(self, text):
        """ULTRA-AGGRESSIVE space fixing for the worst cases"""
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        text = re.sub(r'(\d)([a-zA-Z])', r'\1 \2', text)
        text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)
        
        academic_phrases = {
            r'programfor': 'program for', r'themice': 'the mice',
            r'micewelfare': 'mice welfare', r'arediscussed': 'are discussed',
            r'malemice': 'male mice', r'canbe': 'can be',
            r'spacebiomedical': 'space biomedical', r'etal': 'et al',
            r'Micein': 'Mice in', r'SpaceMission': 'Space Mission',
            r'Trainingand': 'Training and', r'PLo SONE': 'PLoS ONE',
        }
        
        for pattern, replacement in academic_phrases.items():
            text = text.replace(pattern, replacement)
        
        return text
    
    def apply_wordninja_targeted(self, text):
        """TARGETED WordNinja application only to obvious concatenations"""
        if not WORDNINJA_AVAILABLE:
            return text
        
        words = text.split()
        fixed_words = []
        
        for word in words:
            if (len(word) >= 15 and 
                sum(1 for c in word if c.isalpha()) / len(word) > 0.8 and
                not any(char.isupper() for char in word[1:])):
                try:
                    split_words = wordninja.split(word)
                    if len(split_words) > 1 and all(len(sw) >= 2 for sw in split_words):
                        fixed_words.append(' '.join(split_words))
                    else:
                        fixed_words.append(word)
                except:
                    fixed_words.append(word)
            else:
                fixed_words.append(word)
        
        return ' '.join(fixed_words)
    
    def intelligent_space_recovery(self, text):
        """Recover spaces in specific academic contexts"""
        text = re.sub(r'([a-z])(\(20\d{2})', r'\1 \2', text)
        text = re.sub(r'(\d{4})\)([A-Z])', r'\1) \2', text)
        text = re.sub(r'(\S+@\S+\.\S+)', lambda m: m.group(1).replace(' ', ''), text)
        text = re.sub(r'PLo\s*S\s*ONE', 'PLoS ONE', text)
        text = re.sub(r'\s+([.,;!?])', r'\1', text)
        text = re.sub(r'([.,;!?])([A-Za-z])', r'\1 \2', text)
        
        return text
    
    def format_with_proper_paragraphs(self, text):
        """SIMPLE and RELIABLE paragraph formatting"""
        paragraphs = text.split('\n\n')
        
        formatted_paragraphs = []
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            para = re.sub(r' {2,}', ' ', para)
            sentences = re.split(r'(?<=[.!?])\s+', para)
            
            clean_sentences = []
            for sentence in sentences:
                sentence = sentence.strip()
                if sentence:
                    if sentence and sentence[0].islower() and len(sentence) > 10:
                        sentence = sentence[0].upper() + sentence[1:]
                    clean_sentences.append(sentence)
            
            formatted_para = ' '.join(clean_sentences)
            formatted_paragraphs.append(formatted_para)
        
        return '\n\n'.join(formatted_paragraphs)
    
    def extract_clean_text(self, pdf_path):
        """Extract and clean text from a single PDF"""
        # Reset patterns for each document
        self.page_patterns = {'headers': [], 'footers': [], 'page_numbers': []}
        
        all_paragraphs = []
        
        with pdfplumber.open(pdf_path) as pdf:
            self.analyze_document(pdf)
            total_pages = len(pdf.pages)
            
            for page_num, page in enumerate(pdf.pages, 1):
                text = self.extract_text_with_spacing(page)
                if not text:
                    continue
                
                cleaned_lines = self.clean_page_text(text, page_num, total_pages)
                
                if cleaned_lines:
                    page_paragraphs = self.simple_paragraph_reconstruction(cleaned_lines)
                    all_paragraphs.extend(page_paragraphs)
        
        full_text = '\n\n'.join(all_paragraphs)
        
        if '\n\n' not in full_text and len(full_text) > 500:
            sentences = re.split(r'(?<=[.!?])\s+', full_text)
            paragraphs = []
            current_para = []
            
            for i, sentence in enumerate(sentences):
                current_para.append(sentence)
                if len(current_para) >= 4 or i == len(sentences) - 1:
                    paragraphs.append(' '.join(current_para))
                    current_para = []
            
            full_text = '\n\n'.join(paragraphs)
        
        full_text = self.merge_hyphenated_words(full_text)
        full_text = self.ultra_aggressive_space_fix(full_text)
        full_text = self.intelligent_space_recovery(full_text)
        
        if WORDNINJA_AVAILABLE:
            full_text = self.apply_wordninja_targeted(full_text)
        
        full_text = re.sub(r' {2,}', ' ', full_text)
        full_text = self.format_with_proper_paragraphs(full_text)
        
        return full_text.strip()
    
    # ==================== CHUNKING METHODS ====================
    
    def chunk_text(self, text, max_chars=800, overlap=100):
        """
        Split text into chunks with sliding window overlap.
        Keeps semantic continuity.
        """
        chunks = []
        start = 0
        while start < len(text):
            end = start + max_chars
            chunk = text[start:end]
            
            if end < len(text):
                period = chunk.rfind(".")
                if period != -1 and period > max_chars * 0.5:
                    chunk = chunk[:period+1]
                    end = start + period + 1
            
            chunks.append(chunk.strip())
            start = end - overlap
        
        return chunks
    
    def create_chunk_objects(self, chunks, paper_id):
        """Create JSON objects for each chunk"""
        chunk_objects = []
        for i, chunk in enumerate(chunks):
            obj = {
                "paper_id": paper_id,
                "chunk_id": f"{paper_id}_{i}",
                "text": chunk,
                "organism": [],
                "assay": [],
                "gene": [],
                "mission": [],
                "experimenttype": [],
                "outcome": []
            }
            chunk_objects.append(obj)
        
        return chunk_objects
    
    # ==================== MAIN PIPELINE ====================
    
    def process_single_pdf(self, pdf_path, paper_id):
        """Process a single PDF: extract → clean → chunk → return objects"""
        try:
            print(f"📄 Processing: {pdf_path.name}")
            
            # Extract and clean text
            clean_text = self.extract_clean_text(pdf_path)
            
            if not clean_text or len(clean_text) < 100:
                print(f"⚠️  Skipping {pdf_path.name}: insufficient text extracted")
                return None
            
            # Create chunks
            chunks = self.chunk_text(clean_text, max_chars=800, overlap=100)
            
            # Create chunk objects
            chunk_objects = self.create_chunk_objects(chunks, paper_id)
            
            print(f"✅ Created {len(chunk_objects)} chunks for paper {paper_id}")
            
            return chunk_objects
            
        except Exception as e:
            print(f"❌ Error processing {pdf_path.name}: {str(e)}")
            return None
    
    def process_all_pdfs(self):
        """Process all PDFs in the directory"""
        pdf_files = sorted(list(self.pdf_directory.glob("*.pdf")))[:self.max_pdfs]
        
        if not pdf_files:
            print(f"❌ No PDF files found in {self.pdf_directory}")
            return
        
        print(f"\n🚀 Starting pipeline for {len(pdf_files)} PDFs...")
        print(f"📂 Input: {self.pdf_directory}")
        print(f"📂 Output: {self.output_directory}\n")
        
        stats = {
            'processed': 0,
            'failed': 0,
            'total_chunks': 0
        }
        
        for pdf_file in pdf_files:
            # Extract paper ID from filename (e.g., "1.pdf" → "1")
            paper_id = pdf_file.stem
            
            # Process PDF
            chunk_objects = self.process_single_pdf(pdf_file, paper_id)
            
            if chunk_objects:
                # Save to JSONL
                output_file = self.output_directory / f"{paper_id}_chunks.jsonl"
                with open(output_file, "w", encoding="utf-8") as f:
                    for obj in chunk_objects:
                        f.write(json.dumps(obj, ensure_ascii=False) + "\n")
                
                stats['processed'] += 1
                stats['total_chunks'] += len(chunk_objects)
            else:
                stats['failed'] += 1
        
        # Print summary
        print(f"\n{'='*60}")
        print(f"🎉 PIPELINE COMPLETE")
        print(f"{'='*60}")
        print(f"✅ Successfully processed: {stats['processed']} PDFs")
        print(f"❌ Failed: {stats['failed']} PDFs")
        print(f"📊 Total chunks created: {stats['total_chunks']}")
        print(f"📂 Output location: {self.output_directory}")
        print(f"{'='*60}\n")


# ==================== USAGE ====================

if __name__ == "__main__":
    # Configuration
    PDF_DIRECTORY = "data/papers"
    OUTPUT_DIRECTORY = "data/chunks"
    MAX_PDFS = 100  # Process first 100 PDFs (easily scalable)
    
    # Create and run pipeline
    pipeline = PDFToChunksPipeline(
        pdf_directory=PDF_DIRECTORY,
        output_directory=OUTPUT_DIRECTORY,
        max_pdfs=MAX_PDFS
    )
    
    pipeline.process_all_pdfs()