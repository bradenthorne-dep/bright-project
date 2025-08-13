#!/usr/bin/env python3
"""
Convert All PDFs to Text

Finds all PDF files in project_data/raw directory and converts them to text files 
in the same location using the existing PDF processor.
"""

import os
import sys
from pathlib import Path

# Import the existing PDF processor
from pdf_processor import PDFProcessor

def main():
    # Get the project root directory (parent of backend)
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(backend_dir)
    raw_data_dir = Path(project_dir) / "project_data" / "raw"
    
    # Check if raw directory exists
    if not raw_data_dir.exists():
        print(f"Error: Directory {raw_data_dir} does not exist.")
        sys.exit(1)
    
    # Specify project if passed as argument, otherwise process all
    specific_project = sys.argv[1] if len(sys.argv) > 1 else None
    
    # Find PDF files
    if specific_project:
        project_dir = raw_data_dir / specific_project
        if not project_dir.exists():
            print(f"Project directory not found: {project_dir}")
            sys.exit(1)
        pdf_files = list(project_dir.glob("**/*.pdf"))
    else:
        pdf_files = list(raw_data_dir.glob("**/*.pdf"))
    
    print(f"Found {len(pdf_files)} PDF files to process")
    
    # Process each PDF file
    success_count = 0
    for pdf_path in pdf_files:
        try:
            # Create processor with output directory same as PDF location
            output_dir = str(pdf_path.parent)
            processor = PDFProcessor(output_dir)
            
            # Set output file name to be same as PDF but with .txt extension
            processor.output_file = f"{pdf_path.stem}.txt"
            
            # Read PDF content
            with open(pdf_path, 'rb') as file:
                pdf_content = file.read()
            
            # Process the PDF
            print(f"Processing {pdf_path}...")
            result = processor.extract_text_from_pdf(pdf_content, pdf_path.name)
            
            if result["success"]:
                success_count += 1
                print(f"  Success: Created {processor.output_file}")
            else:
                print(f"  Failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"  Error processing {pdf_path}: {str(e)}")
    
    print(f"\nProcessing complete: {success_count}/{len(pdf_files)} successful")

if __name__ == "__main__":
    main()