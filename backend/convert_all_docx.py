#!/usr/bin/env python3
"""
Convert All DOCX to Text

Finds all DOCX files in project_data/raw directory and converts them to text files 
in the same location using the existing DOCX processor.
"""

import os
import sys
from pathlib import Path

# Import the existing DOCX processor
from docx_processor import DOCXProcessor

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
    
    # Find DOCX files
    if specific_project:
        project_dir = raw_data_dir / specific_project
        if not project_dir.exists():
            print(f"Project directory not found: {project_dir}")
            sys.exit(1)
        docx_files = list(project_dir.glob("**/*.docx"))
    else:
        docx_files = list(raw_data_dir.glob("**/*.docx"))
    
    print(f"Found {len(docx_files)} DOCX files to process")
    
    # Process each DOCX file
    success_count = 0
    for docx_path in docx_files:
        try:
            # Create processor with output directory same as DOCX location
            output_dir = str(docx_path.parent)
            processor = DOCXProcessor(output_dir)
            
            # Set output file name to be same as DOCX but with .txt extension
            processor.output_file = f"{docx_path.stem}.txt"
            
            # Read DOCX content
            with open(docx_path, 'rb') as file:
                docx_content = file.read()
            
            # Process the DOCX
            print(f"Processing {docx_path}...")
            result = processor.extract_text_from_docx(docx_content, docx_path.name)
            
            if result["success"]:
                success_count += 1
                print(f"  Success: Created {processor.output_file}")
            else:
                print(f"  Failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"  Error processing {docx_path}: {str(e)}")
    
    print(f"\nProcessing complete: {success_count}/{len(docx_files)} successful")

if __name__ == "__main__":
    main()