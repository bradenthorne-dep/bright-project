#!/usr/bin/env python3
"""
Convert All Documents to Text

This script runs both PDF and DOCX converters to process all document files
in the project_data/raw directory.
"""

import os
import sys
import subprocess

def main():
    # Get current directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Get project name from command line if provided
    project_arg = sys.argv[1:] if len(sys.argv) > 1 else []
    
    print("Converting PDF files...")
    pdf_script = os.path.join(script_dir, "convert_all_pdfs.py")
    subprocess.run([sys.executable, pdf_script] + project_arg)
    
    print("\nConverting DOCX files...")
    docx_script = os.path.join(script_dir, "convert_all_docx.py")
    subprocess.run([sys.executable, docx_script] + project_arg)
    
    print("\nConverting Excel files...")
    xlsx_script = os.path.join(script_dir, "convert_all_xlsx.py")
    subprocess.run([sys.executable, xlsx_script] + project_arg)
    
    print("\nAll document conversions complete!")

if __name__ == "__main__":
    main()