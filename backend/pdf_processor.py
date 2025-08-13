"""
PDF processing module for extracting text from PDF documents

Uses pdfplumber to read PDF files and extract text content,
saving the results to output files for further processing.
"""

import pdfplumber
import os
from datetime import datetime
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self, output_dir: str = "."):
        """
        Initialize PDF processor with output directory
        
        Args:
            output_dir: Directory to save extracted text file (defaults to current directory)
        """
        self.output_dir = output_dir
        self.output_file = "design_doc.txt"
        # No need to create directory since we're using current directory
    
    def extract_text_from_pdf(self, pdf_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Extract text from PDF content and save to single output file
        
        Args:
            pdf_content: PDF file content as bytes
            filename: Original filename of the PDF
            
        Returns:
            Dictionary containing extraction results and metadata
        """
        try:
            # Use single output file path
            output_path = os.path.join(self.output_dir, self.output_file)
            
            # Extract text from PDF
            extracted_text = ""
            page_count = 0
            
            # Create a temporary file to work with pdfplumber
            temp_pdf_path = os.path.join(self.output_dir, "temp_processing.pdf")
            
            try:
                # Write PDF content to temporary file
                with open(temp_pdf_path, 'wb') as temp_file:
                    temp_file.write(pdf_content)
                
                # Extract text using pdfplumber
                with pdfplumber.open(temp_pdf_path) as pdf:
                    page_count = len(pdf.pages)
                    
                    for page_num, page in enumerate(pdf.pages, 1):
                        page_text = page.extract_text()
                        if page_text:
                            extracted_text += f"--- Page {page_num} ---\n"
                            extracted_text += page_text
                            extracted_text += f"\n\n"
                        else:
                            extracted_text += f"--- Page {page_num} ---\n"
                            extracted_text += "[No extractable text found on this page]\n\n"
                
                # Write extracted text to output file
                with open(output_path, 'w', encoding='utf-8') as output_file:
                    output_file.write(f"PDF Text Extraction Results\n")
                    output_file.write(f"Original File: {filename}\n")
                    output_file.write(f"Extracted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                    output_file.write(f"Total Pages: {page_count}\n")
                    output_file.write("=" * 50 + "\n\n")
                    output_file.write(extracted_text)
                
                # Clean up temporary file
                if os.path.exists(temp_pdf_path):
                    os.remove(temp_pdf_path)
                
                # Calculate statistics
                word_count = len(extracted_text.split()) if extracted_text.strip() else 0
                char_count = len(extracted_text)
                
                logger.info(f"Successfully extracted text from {filename}: {page_count} pages, {word_count} words")
                
                return {
                    "success": True,
                    "output_file": self.output_file,
                    "output_path": output_path,
                    "page_count": page_count,
                    "word_count": word_count,
                    "character_count": char_count,
                    "has_text": word_count > 0,
                    "extraction_time": datetime.now().isoformat()
                }
                
            except Exception as e:
                # Clean up temporary file on error
                if os.path.exists(temp_pdf_path):
                    os.remove(temp_pdf_path)
                raise e
                
        except Exception as e:
            logger.error(f"Error extracting text from PDF {filename}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "output_file": None,
                "page_count": 0,
                "word_count": 0,
                "character_count": 0,
                "has_text": False,
                "extraction_time": datetime.now().isoformat()
            }
    
    def get_extracted_text(self) -> Optional[str]:
        """
        Read content from the current extracted text file
        
        Returns:
            File content as string, or None if file doesn't exist
        """
        try:
            output_path = os.path.join(self.output_dir, self.output_file)
            if os.path.exists(output_path):
                with open(output_path, 'r', encoding='utf-8') as file:
                    return file.read()
            return None
        except Exception as e:
            logger.error(f"Error reading extracted text file: {str(e)}")
            return None
    
    def has_extracted_text(self) -> bool:
        """
        Check if extracted text file exists
        
        Returns:
            True if extracted text file exists, False otherwise
        """
        output_path = os.path.join(self.output_dir, self.output_file)
        return os.path.exists(output_path)


# Global PDF processor instance
pdf_processor = PDFProcessor()