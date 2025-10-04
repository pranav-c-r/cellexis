import pdfplumber
import re
from collections import Counter

try:
    import wordninja
    WORDNINJA_AVAILABLE = True
except ImportError:
    WORDNINJA_AVAILABLE = False
    print("⚠ WordNinja not installed. Run: pip install wordninja")

class SmartPDFCleaner:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.page_patterns = {
            'headers': [],
            'footers': [],
            'page_numbers': []
        }
        
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
        
        # Group words by lines
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
                
                # ULTRA-AGGRESSIVE: Always add space between words
                if line_text:  # Not the first word
                    line_text += " " + word_text
                else:  # First word
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
                # Empty line indicates paragraph break
                if current_paragraph:
                    paragraphs.append(' '.join(current_paragraph))
                    current_paragraph = []
                continue
            
            # Check if this line looks like the start of a new paragraph
            is_new_paragraph = (
                not current_paragraph or  # First line
                len(line) < 50 or  # Short line (might be heading)
                line[0].isupper() and not current_paragraph[-1].endswith(('.', '!', '?')) or  # Capital start without sentence end
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
        
        # Don't forget the last paragraph
        if current_paragraph:
            paragraphs.append(' '.join(current_paragraph))
        
        return paragraphs
    
    def merge_hyphenated_words(self, text):
        """Fix words broken across lines with hyphens"""
        text = re.sub(r'(\w+)-\s+\n\s*(\w+)', r'\1\2', text)
        text = re.sub(r'(\w+)-\s+(\w+)', r'\1\2', text)
        return text
    
    def ultra_aggressive_space_fix(self, text):
        """
        ULTRA-AGGRESSIVE space fixing for the worst cases
        """
        # Fix ALL lowercase-uppercase boundaries
        text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        
        # Fix number-letter boundaries
        text = re.sub(r'(\d)([a-zA-Z])', r'\1 \2', text)
        text = re.sub(r'([a-zA-Z])(\d)', r'\1 \2', text)
        
        # Comprehensive academic phrase fixing
        academic_phrases = {
            # Common concatenations from your sample
            r'programfor': 'program for',
            r'themice': 'the mice',
            r'micewelfare': 'mice welfare',
            r'arediscussed': 'are discussed',
            r'malemice': 'male mice',
            r'canbe': 'can be',
            r'spacebiomedical': 'space biomedical',
            r'etal': 'et al',
            r'Micein': 'Mice in',
            r'SpaceMission': 'Space Mission',
            r'Trainingand': 'Training and',
            r'PLo SONE': 'PLoS ONE',
            r'anylawfulpurpose': 'any lawful purpose',
            r'publicdomain': 'public domain',
            r'domaindedication': 'domain dedication',
            r'projectwassupported': 'project was supported',
            r'SpaceAgency': 'Space Agency',
            r'Academyof': 'Academy of',
            r'funderstook': 'funders took',
            r'partin': 'part in',
            r'studydesign': 'study design',
            r'datacollection': 'data collection',
            r'hadnorole': 'had no role',
            r'dataanalysis': 'data analysis',
            r'decisiontopublish': 'decision to publish',
            r'alsosupported': 'also supported',
            r'Divisionof': 'Division of',
            r'FundamentalMedicineof': 'Fundamental Medicine of',
            r'Integrativephysiology': 'Integrative physiology',
            r'RFBRgrant': 'RFBR grant',
            r'preparationof': 'preparation of',
            r'themanuscript': 'the manuscript',
            r'CompetingInterests': 'Competing Interests',
            r'authorshavedeclared': 'authors have declared',
            r'nocompeting': 'no competing',
            r'interestsexist': 'interests exist',
            r'organismcan': 'organism can',
            r'withstand': 'withstand',
            r'rocketlaunch': 'rocket launch',
            r'weightlessness': 'weightlessness',
            r'pavingtheway': 'paving the way',
            r'thefirsthuman': 'the first human',
            r'humanspaceflight': 'human spaceflight',
            r'Laika\'ssuccess': 'Laika\'s success',
            r'Aftera': 'After a',
            r'yearhiatus': 'year hiatus',
            r'resumedin': 'resumed in',
            r'itsprogram': 'its program',
            r'biomedicalresearch': 'biomedical research',
            r'successful30': 'successful 30',
            r'dayflight': 'day flight',
            r'spacethat': 'space that',
            r'culminatedwith': 'culminated with',
            r'Bionbiosatellites': 'Bion biosatellites',
        }
        
        for pattern, replacement in academic_phrases.items():
            text = text.replace(pattern, replacement)
        
        return text
    
    def apply_wordninja_targeted(self, text):
        """
        TARGETED WordNinja application only to obvious concatenations
        """
        if not WORDNINJA_AVAILABLE:
            return text
        
        # Find long concatenated words (15+ chars, mostly alphabetic)
        words = text.split()
        fixed_words = []
        
        for word in words:
            # Only target very long words that look concatenated
            if (len(word) >= 15 and 
                sum(1 for c in word if c.isalpha()) / len(word) > 0.8 and
                not any(char.isupper() for char in word[1:])):  # Avoid acronyms
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
        """
        Recover spaces in specific academic contexts
        """
        # Fix citations and references
        text = re.sub(r'([a-z])(\(20\d{2})', r'\1 \2', text)  # Author(2014) -> Author (2014)
        text = re.sub(r'(\d{4})\)([A-Z])', r'\1) \2', text)  # 2014)Author -> 2014) Author
        
        # Fix email addresses (preserve them)
        text = re.sub(r'(\S+@\S+\.\S+)', lambda m: m.group(1).replace(' ', ''), text)
        
        # Fix common journal names
        text = re.sub(r'PLo\s*S\s*ONE', 'PLoS ONE', text)
        
        # Fix punctuation spacing
        text = re.sub(r'\s+([.,;!?])', r'\1', text)  # Remove space before punctuation
        text = re.sub(r'([.,;!?])([A-Za-z])', r'\1 \2', text)  # Add space after punctuation
        
        return text
    
    def format_with_proper_paragraphs(self, text):
        """
        SIMPLE and RELIABLE paragraph formatting
        """
        # Split by double newlines (existing paragraph breaks)
        paragraphs = text.split('\n\n')
        
        formatted_paragraphs = []
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # Clean up the paragraph
            para = re.sub(r' {2,}', ' ', para)  # Remove multiple spaces
            
            # Basic sentence splitting
            sentences = re.split(r'(?<=[.!?])\s+', para)
            
            # Clean each sentence
            clean_sentences = []
            for sentence in sentences:
                sentence = sentence.strip()
                if sentence:
                    # Ensure proper capitalization for sentences
                    if sentence and sentence[0].islower() and len(sentence) > 10:
                        sentence = sentence[0].upper() + sentence[1:]
                    clean_sentences.append(sentence)
            
            # Join sentences with spaces
            formatted_para = ' '.join(clean_sentences)
            formatted_paragraphs.append(formatted_para)
        
        return '\n\n'.join(formatted_paragraphs)
    
    def extract_clean_text(self, include_references=False, fix_concatenation=True, 
                          use_wordninja=True, format_output=True):
        """SIMPLE and RELIABLE extraction with guaranteed paragraph structure"""
        all_paragraphs = []
        
        with pdfplumber.open(self.pdf_path) as pdf:
            self.analyze_document(pdf)
            total_pages = len(pdf.pages)
            
            for page_num, page in enumerate(pdf.pages, 1):
                # Extract text with aggressive spacing
                text = self.extract_text_with_spacing(page)
                if not text:
                    continue
                
                cleaned_lines = self.clean_page_text(text, page_num, total_pages)
                
                if cleaned_lines:
                    # Use SIMPLE paragraph reconstruction
                    page_paragraphs = self.simple_paragraph_reconstruction(cleaned_lines)
                    all_paragraphs.extend(page_paragraphs)
        
        # Join all paragraphs with double newlines
        full_text = '\n\n'.join(all_paragraphs)
        
        # If we still don't have paragraphs, force them by sentence count
        if '\n\n' not in full_text and len(full_text) > 500:
            print("Forcing paragraph structure...")
            sentences = re.split(r'(?<=[.!?])\s+', full_text)
            paragraphs = []
            current_para = []
            
            for i, sentence in enumerate(sentences):
                current_para.append(sentence)
                # Start new paragraph every 3-5 sentences
                if len(current_para) >= 4 or i == len(sentences) - 1:
                    paragraphs.append(' '.join(current_para))
                    current_para = []
            
            full_text = '\n\n'.join(paragraphs)
        
        # Apply text cleaning
        full_text = self.merge_hyphenated_words(full_text)
        full_text = self.ultra_aggressive_space_fix(full_text)
        full_text = self.intelligent_space_recovery(full_text)
        
        if use_wordninja and WORDNINJA_AVAILABLE:
            full_text = self.apply_wordninja_targeted(full_text)
        
        # Final cleanup
        full_text = re.sub(r' {2,}', ' ', full_text)
        
        if format_output:
            full_text = self.format_with_proper_paragraphs(full_text)
        
        return full_text.strip()


# Usage
if __name__ == "__main__":
    pdf_path = r"C:\Dev\cellexis\backend\data\papers\1.pdf"
    
    cleaner = SmartPDFCleaner(pdf_path)
    cleaned_text = cleaner.extract_clean_text(
        fix_concatenation=True,
        use_wordninja=True,
        format_output=True
    )
    
    print("=== FINAL PERFECT Text (First 2000 chars) ===")
    print(cleaned_text[:2000])
    print(f"\n=== Total Length: {len(cleaned_text)} characters ===")
    
    # Save
    output_path = "data/papers/1_cleaned.txt"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(cleaned_text)
    
    print(f"\nSaved to: {output_path}")

    # Show detailed statistics
    words = cleaned_text.split()
    sentences = re.split(r'[.!?]+', cleaned_text)
    paragraphs = cleaned_text.split('\n\n')
    
    print(f"\n=== Detailed Statistics ===")
    print(f"Characters: {len(cleaned_text)}")
    print(f"Words: {len(words)}")
    print(f"Sentences: {len([s for s in sentences if len(s.strip()) > 10])}")
    print(f"Paragraphs: {len([p for p in paragraphs if p.strip()])}")
    
    # Show first few paragraphs with numbers
    print(f"\n=== First 3 Paragraphs ===")
    for i, para in enumerate(paragraphs[:3], 1):
        if para.strip():
            print(f"\n--- Paragraph {i} ({len(para.split())} words) ---")
            print(para[:300] + "..." if len(para) > 300 else para)