"""
Excel processing module for converting XLSX files to JSON format

Uses pandas and openpyxl to read Excel files and convert data to JSON,
saving the results to output files for further processing.
"""

import pandas as pd
import os
import json
from datetime import datetime, time
from typing import Dict, Any, Optional, List
import logging
import numpy as np

logger = logging.getLogger(__name__)

class XLSXProcessor:
    def __init__(self, output_dir: str = "."):
        """
        Initialize Excel processor with output directory
        
        Args:
            output_dir: Directory to save extracted JSON file (defaults to current directory)
        """
        self.output_dir = output_dir
        self.output_file = "excel_data.json"
    
    def convert_xlsx_to_json(self, xlsx_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Convert Excel file content to JSON and save to output file
        
        Args:
            xlsx_content: Excel file content as bytes
            filename: Original filename of the Excel file
            
        Returns:
            Dictionary containing conversion results and metadata
        """
        try:
            # Use output file path
            output_path = os.path.join(self.output_dir, self.output_file)
            
            # Create a temporary file to work with pandas
            temp_xlsx_path = os.path.join(self.output_dir, "temp_processing.xlsx")
            
            try:
                # Write Excel content to temporary file
                with open(temp_xlsx_path, 'wb') as temp_file:
                    temp_file.write(xlsx_content)
                
                # Read all sheets from the Excel file
                excel_file = pd.ExcelFile(temp_xlsx_path)
                sheet_names = excel_file.sheet_names
                
                # Process each sheet
                result_data = {}
                total_rows = 0
                
                for sheet_name in sheet_names:
                    # Read the sheet into a DataFrame
                    df = pd.read_excel(temp_xlsx_path, sheet_name=sheet_name)
                    
                    # Convert DataFrame to dict and handle NaN values
                    sheet_data = df.fillna("").to_dict(orient='records')
                    result_data[sheet_name] = sheet_data
                    total_rows += len(sheet_data)
                
                # Add metadata
                metadata = {
                    "original_filename": filename,
                    "conversion_time": datetime.now().isoformat(),
                    "sheet_count": len(sheet_names),
                    "sheet_names": sheet_names,
                    "total_rows": total_rows
                }
                
                # Create the final JSON structure
                json_result = {
                    "metadata": metadata,
                    "data": result_data
                }
                
                # Custom JSON encoder to handle datetime objects
                class DateTimeEncoder(json.JSONEncoder):
                    def default(self, obj):
                        if isinstance(obj, (datetime, pd.Timestamp)):
                            return obj.isoformat()
                        elif isinstance(obj, time):
                            return obj.strftime('%H:%M:%S')
                        elif pd.isna(obj):
                            return None
                        elif isinstance(obj, np.int64):
                            return int(obj)
                        elif isinstance(obj, np.float64):
                            return float(obj)
                        elif isinstance(obj, np.bool_):
                            return bool(obj)
                        return super().default(obj)
                
                # Write JSON to output file
                with open(output_path, 'w', encoding='utf-8') as output_file:
                    json.dump(json_result, output_file, indent=2, ensure_ascii=False, cls=DateTimeEncoder)
                
                # Clean up temporary file
                if os.path.exists(temp_xlsx_path):
                    os.remove(temp_xlsx_path)
                
                logger.info(f"Successfully converted {filename} to JSON: {len(sheet_names)} sheets, {total_rows} rows")
                
                return {
                    "success": True,
                    "output_file": self.output_file,
                    "output_path": output_path,
                    "sheet_count": len(sheet_names),
                    "total_rows": total_rows,
                    "sheet_names": sheet_names,
                    "conversion_time": datetime.now().isoformat()
                }
                
            except Exception as e:
                # Clean up temporary file on error
                if os.path.exists(temp_xlsx_path):
                    os.remove(temp_xlsx_path)
                raise e
                
        except Exception as e:
            logger.error(f"Error converting Excel file {filename} to JSON: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "output_file": None,
                "sheet_count": 0,
                "total_rows": 0,
                "sheet_names": [],
                "conversion_time": datetime.now().isoformat()
            }
    
    def get_json_data(self) -> Optional[Dict]:
        """
        Read content from the current JSON output file
        
        Returns:
            File content as dict, or None if file doesn't exist
        """
        try:
            output_path = os.path.join(self.output_dir, self.output_file)
            if os.path.exists(output_path):
                with open(output_path, 'r', encoding='utf-8') as file:
                    return json.load(file)
            return None
        except Exception as e:
            logger.error(f"Error reading JSON output file: {str(e)}")
            return None
    
    def has_json_data(self) -> bool:
        """
        Check if JSON output file exists
        
        Returns:
            True if JSON output file exists, False otherwise
        """
        output_path = os.path.join(self.output_dir, self.output_file)
        return os.path.exists(output_path)


# Global XLSX processor instance
xlsx_processor = XLSXProcessor()