#!/usr/bin/env python3
"""
Convert All Excel Files to JSON

Finds all Excel files (xlsx) in project_data/raw directory and converts them to JSON files 
in the same location using the Excel processor.
"""

import os
import sys
from pathlib import Path

# Import the Excel processor
from xlsx_processor import XLSXProcessor

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
    
    # Find Excel files
    if specific_project:
        project_dir = raw_data_dir / specific_project
        if not project_dir.exists():
            print(f"Project directory not found: {project_dir}")
            sys.exit(1)
        xlsx_files = list(project_dir.glob("**/*.xlsx"))
        # Also look for .xls files
        xlsx_files.extend(list(project_dir.glob("**/*.xls")))
    else:
        xlsx_files = list(raw_data_dir.glob("**/*.xlsx"))
        # Also look for .xls files
        xlsx_files.extend(list(raw_data_dir.glob("**/*.xls")))
    
    print(f"Found {len(xlsx_files)} Excel files to process")
    
    # Process each Excel file
    success_count = 0
    for xlsx_path in xlsx_files:
        try:
            # Create processor with output directory same as Excel file location
            output_dir = str(xlsx_path.parent)
            processor = XLSXProcessor(output_dir)
            
            # Set output file name to be same as Excel file but with .json extension
            processor.output_file = f"{xlsx_path.stem}.json"
            
            # Read Excel content
            with open(xlsx_path, 'rb') as file:
                xlsx_content = file.read()
            
            # Process the Excel file
            print(f"Processing {xlsx_path}...")
            result = processor.convert_xlsx_to_json(xlsx_content, xlsx_path.name)
            
            if result["success"]:
                success_count += 1
                print(f"  Success: Created {processor.output_file}")
            else:
                print(f"  Failed: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"  Error processing {xlsx_path}: {str(e)}")
    
    print(f"\nProcessing complete: {success_count}/{len(xlsx_files)} successful")

if __name__ == "__main__":
    main()