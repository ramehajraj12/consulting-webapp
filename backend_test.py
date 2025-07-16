#!/usr/bin/env python3
"""
Comprehensive Backend Testing for SPSSAU Statistical Analysis Platform
Tests all backend APIs including data upload, dataset management, data preview, and statistical analysis
"""

import requests
import json
import pandas as pd
import io
import os
import time
from pathlib import Path

# Get backend URL from frontend .env file
def get_backend_url():
    frontend_env_path = Path("/app/frontend/.env")
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing backend at: {API_URL}")

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.uploaded_datasets = []
        
    def test_api_root(self):
        """Test API root endpoint"""
        print("\n=== Testing API Root Endpoint ===")
        try:
            response = self.session.get(f"{API_URL}/")
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"Response: {data}")
                return True
            else:
                print(f"Error: {response.text}")
                return False
        except Exception as e:
            print(f"Exception: {e}")
            return False
    
    def create_test_csv_data(self):
        """Create test CSV data for upload"""
        data = {
            'student_id': [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010],
            'name': ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown', 
                    'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Anderson'],
            'age': [20, 21, 19, 22, 20, 23, 19, 21, 20, 22],
            'gender': ['Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male', 'Female', 'Male'],
            'major': ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 
                     'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
            'gpa': [3.8, 3.6, 3.9, 3.4, 3.7, 3.5, 3.8, 3.6, 3.9, 3.3],
            'credits': [120, 110, 130, 100, 115, 105, 125, 108, 135, 95],
            'enrollment_date': ['2021-09-01', '2021-09-01', '2020-09-01', '2022-09-01', '2021-09-01',
                               '2022-09-01', '2020-09-01', '2021-09-01', '2020-09-01', '2022-09-01']
        }
        return pd.DataFrame(data)
    
    def create_test_excel_data(self):
        """Create test Excel data for upload"""
        data = {
            'product_id': [101, 102, 103, 104, 105, 106, 107, 108, 109, 110],
            'product_name': ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones',
                           'Webcam', 'Speaker', 'Tablet', 'Phone', 'Charger'],
            'category': ['Electronics', 'Accessories', 'Accessories', 'Electronics', 'Accessories',
                        'Accessories', 'Accessories', 'Electronics', 'Electronics', 'Accessories'],
            'price': [999.99, 29.99, 79.99, 299.99, 149.99, 89.99, 199.99, 599.99, 799.99, 39.99],
            'stock_quantity': [50, 200, 150, 75, 100, 80, 60, 40, 30, 300],
            'rating': [4.5, 4.2, 4.7, 4.3, 4.6, 4.1, 4.4, 4.8, 4.9, 4.0],
            'reviews_count': [1250, 890, 2100, 650, 1800, 420, 780, 950, 2200, 150]
        }
        return pd.DataFrame(data)
    
    def create_test_json_data(self):
        """Create test JSON data for upload"""
        data = [
            {'employee_id': 2001, 'name': 'Sarah Connor', 'department': 'Engineering', 'salary': 85000, 'experience_years': 5},
            {'employee_id': 2002, 'name': 'John Doe', 'department': 'Marketing', 'salary': 65000, 'experience_years': 3},
            {'employee_id': 2003, 'name': 'Jane Smith', 'department': 'HR', 'salary': 70000, 'experience_years': 7},
            {'employee_id': 2004, 'name': 'Mike Johnson', 'department': 'Engineering', 'salary': 90000, 'experience_years': 8},
            {'employee_id': 2005, 'name': 'Lisa Wang', 'department': 'Finance', 'salary': 75000, 'experience_years': 4},
            {'employee_id': 2006, 'name': 'Tom Brown', 'department': 'Engineering', 'salary': 95000, 'experience_years': 10},
            {'employee_id': 2007, 'name': 'Amy Davis', 'department': 'Marketing', 'salary': 60000, 'experience_years': 2},
            {'employee_id': 2008, 'name': 'Chris Wilson', 'department': 'HR', 'salary': 68000, 'experience_years': 6}
        ]
        return data
    
    def test_data_upload_csv(self):
        """Test CSV file upload"""
        print("\n=== Testing CSV Data Upload ===")
        try:
            # Create test CSV data
            df = self.create_test_csv_data()
            csv_content = df.to_csv(index=False)
            
            # Prepare file upload
            files = {
                'file': ('students.csv', csv_content, 'text/csv')
            }
            data = {
                'name': 'Student Academic Records',
                'description': 'Academic records of university students including GPA, credits, and demographics',
                'tags': 'students, academic, university, gpa'
            }
            
            response = self.session.post(f"{API_URL}/datasets/upload", files=files, data=data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Upload successful: {result['message']}")
                dataset_id = result['dataset']['id']
                self.uploaded_datasets.append(dataset_id)
                print(f"Dataset ID: {dataset_id}")
                print(f"Rows: {result['dataset']['rows']}, Columns: {result['dataset']['columns']}")
                return True, dataset_id
            else:
                print(f"Error: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"Exception: {e}")
            return False, None
    
    def test_data_upload_excel(self):
        """Test Excel file upload"""
        print("\n=== Testing Excel Data Upload ===")
        try:
            # Create test Excel data
            df = self.create_test_excel_data()
            excel_buffer = io.BytesIO()
            df.to_excel(excel_buffer, index=False, engine='openpyxl')
            excel_content = excel_buffer.getvalue()
            
            # Prepare file upload
            files = {
                'file': ('products.xlsx', excel_content, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            }
            data = {
                'name': 'Product Inventory',
                'description': 'E-commerce product inventory with pricing and stock information',
                'tags': 'products, inventory, ecommerce, pricing'
            }
            
            response = self.session.post(f"{API_URL}/datasets/upload", files=files, data=data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Upload successful: {result['message']}")
                dataset_id = result['dataset']['id']
                self.uploaded_datasets.append(dataset_id)
                print(f"Dataset ID: {dataset_id}")
                print(f"Rows: {result['dataset']['rows']}, Columns: {result['dataset']['columns']}")
                return True, dataset_id
            else:
                print(f"Error: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"Exception: {e}")
            return False, None
    
    def test_data_upload_json(self):
        """Test JSON file upload"""
        print("\n=== Testing JSON Data Upload ===")
        try:
            # Create test JSON data
            data_list = self.create_test_json_data()
            json_content = json.dumps(data_list, indent=2)
            
            # Prepare file upload
            files = {
                'file': ('employees.json', json_content, 'application/json')
            }
            data = {
                'name': 'Employee Database',
                'description': 'Company employee records with salary and department information',
                'tags': 'employees, hr, salary, departments'
            }
            
            response = self.session.post(f"{API_URL}/datasets/upload", files=files, data=data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Upload successful: {result['message']}")
                dataset_id = result['dataset']['id']
                self.uploaded_datasets.append(dataset_id)
                print(f"Dataset ID: {dataset_id}")
                print(f"Rows: {result['dataset']['rows']}, Columns: {result['dataset']['columns']}")
                return True, dataset_id
            else:
                print(f"Error: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"Exception: {e}")
            return False, None
    
    def test_dataset_list(self):
        """Test dataset listing"""
        print("\n=== Testing Dataset List ===")
        try:
            response = self.session.get(f"{API_URL}/datasets")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                datasets = response.json()
                print(f"Found {len(datasets)} datasets")
                for dataset in datasets:
                    print(f"- {dataset['name']} (ID: {dataset['id']}, Rows: {dataset['rows']}, Cols: {dataset['columns']})")
                return True
            else:
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"Exception: {e}")
            return False
    
    def test_dataset_get(self, dataset_id):
        """Test getting specific dataset"""
        print(f"\n=== Testing Get Dataset {dataset_id} ===")
        try:
            response = self.session.get(f"{API_URL}/datasets/{dataset_id}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                dataset = response.json()
                print(f"Dataset: {dataset['name']}")
                print(f"File: {dataset['filename']} ({dataset['file_type']})")
                print(f"Size: {dataset['rows']} rows, {dataset['columns']} columns")
                print(f"Columns: {list(dataset['column_info'].keys())}")
                return True
            else:
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"Exception: {e}")
            return False
    
    def test_dataset_preview(self, dataset_id):
        """Test dataset preview"""
        print(f"\n=== Testing Dataset Preview {dataset_id} ===")
        try:
            response = self.session.get(f"{API_URL}/datasets/{dataset_id}/preview?limit=5")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                preview = response.json()
                print(f"Preview: {preview['preview_rows']} of {preview['total_rows']} rows")
                print(f"Columns: {preview['columns']}")
                if preview['data']:
                    print("Sample data:")
                    for i, row in enumerate(preview['data'][:3]):
                        print(f"  Row {i+1}: {row}")
                return True
            else:
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"Exception: {e}")
            return False
    
    def test_descriptive_analysis(self, dataset_id):
        """Test descriptive statistical analysis"""
        print(f"\n=== Testing Descriptive Analysis {dataset_id} ===")
        try:
            analysis_request = {
                "dataset_id": dataset_id,
                "analysis_type": "descriptive",
                "parameters": {}
            }
            
            response = self.session.post(f"{API_URL}/datasets/{dataset_id}/analyze", 
                                       json=analysis_request)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Analysis ID: {result['id']}")
                print(f"Execution time: {result['execution_time']:.3f} seconds")
                if 'descriptive_statistics' in result['results']:
                    stats = result['results']['descriptive_statistics']
                    print(f"Analyzed {result['results']['column_count']} numeric columns")
                    print(f"Columns: {result['results']['analyzed_columns']}")
                else:
                    print(f"Result: {result['results']}")
                return True
            else:
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"Exception: {e}")
            return False
    
    def test_frequency_analysis(self, dataset_id, column_name):
        """Test frequency analysis"""
        print(f"\n=== Testing Frequency Analysis {dataset_id} - Column: {column_name} ===")
        try:
            analysis_request = {
                "dataset_id": dataset_id,
                "analysis_type": "frequency",
                "parameters": {"column": column_name}
            }
            
            response = self.session.post(f"{API_URL}/datasets/{dataset_id}/analyze", 
                                       json=analysis_request)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Analysis ID: {result['id']}")
                print(f"Execution time: {result['execution_time']:.3f} seconds")
                freq_table = result['results']['frequency_table']
                print(f"Frequency analysis for '{column_name}':")
                print(f"Total count: {result['results']['total_count']}")
                print(f"Unique values: {result['results']['unique_values']}")
                print("Top frequencies:")
                for value, count in list(freq_table.items())[:5]:
                    print(f"  {value}: {count}")
                return True
            else:
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"Exception: {e}")
            return False
    
    def test_correlation_analysis(self, dataset_id):
        """Test correlation analysis"""
        print(f"\n=== Testing Correlation Analysis {dataset_id} ===")
        try:
            analysis_request = {
                "dataset_id": dataset_id,
                "analysis_type": "correlation",
                "parameters": {}
            }
            
            response = self.session.post(f"{API_URL}/datasets/{dataset_id}/analyze", 
                                       json=analysis_request)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Analysis ID: {result['id']}")
                print(f"Execution time: {result['execution_time']:.3f} seconds")
                print(f"Analyzed columns: {result['results']['columns']}")
                sig_corr = result['results']['significant_correlations']
                if sig_corr:
                    print("Significant correlations (|r| > 0.7):")
                    for corr in sig_corr:
                        print(f"  {corr['column1']} <-> {corr['column2']}: {corr['correlation']:.3f}")
                else:
                    print("No significant correlations found")
                return True
            else:
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"Exception: {e}")
            return False
    
    def test_dataset_delete(self, dataset_id):
        """Test dataset deletion"""
        print(f"\n=== Testing Dataset Delete {dataset_id} ===")
        try:
            response = self.session.delete(f"{API_URL}/datasets/{dataset_id}")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"Delete successful: {result['message']}")
                return True
            else:
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"Exception: {e}")
            return False
    
    def test_data_type_detection(self, dataset_id):
        """Test data type detection by examining dataset info"""
        print(f"\n=== Testing Data Type Detection {dataset_id} ===")
        try:
            response = self.session.get(f"{API_URL}/datasets/{dataset_id}")
            
            if response.status_code == 200:
                dataset = response.json()
                column_info = dataset['column_info']
                
                print("Data type detection results:")
                for col_name, col_info in column_info.items():
                    data_type = col_info['data_type']
                    sample_values = col_info['sample_values']
                    print(f"  {col_name}: {data_type} (samples: {sample_values})")
                    
                    # Verify statistics are appropriate for data type
                    if 'statistics' in col_info and col_info['statistics']:
                        stats = col_info['statistics']
                        if data_type == 'numeric':
                            expected_keys = ['mean', 'median', 'std', 'min', 'max']
                            if any(key in stats for key in expected_keys):
                                print(f"    ✓ Numeric statistics present")
                            else:
                                print(f"    ✗ Missing numeric statistics")
                        elif data_type == 'categorical':
                            if 'mode' in stats or 'categories' in stats:
                                print(f"    ✓ Categorical statistics present")
                            else:
                                print(f"    ✗ Missing categorical statistics")
                
                return True
            else:
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"Exception: {e}")
            return False
    
    def run_comprehensive_test(self):
        """Run all backend tests"""
        print("=" * 60)
        print("SPSSAU Backend Comprehensive Testing")
        print("=" * 60)
        
        results = {}
        
        # Test API root
        results['api_root'] = self.test_api_root()
        
        # Test data uploads
        results['csv_upload'], csv_dataset_id = self.test_data_upload_csv()
        results['excel_upload'], excel_dataset_id = self.test_data_upload_excel()
        results['json_upload'], json_dataset_id = self.test_data_upload_json()
        
        # Test dataset management
        results['dataset_list'] = self.test_dataset_list()
        
        # Test with CSV dataset (students data)
        if csv_dataset_id:
            results['dataset_get_csv'] = self.test_dataset_get(csv_dataset_id)
            results['dataset_preview_csv'] = self.test_dataset_preview(csv_dataset_id)
            results['data_type_detection_csv'] = self.test_data_type_detection(csv_dataset_id)
            results['descriptive_analysis_csv'] = self.test_descriptive_analysis(csv_dataset_id)
            results['frequency_analysis_csv'] = self.test_frequency_analysis(csv_dataset_id, 'major')
            results['correlation_analysis_csv'] = self.test_correlation_analysis(csv_dataset_id)
        
        # Test with Excel dataset (products data)
        if excel_dataset_id:
            results['dataset_get_excel'] = self.test_dataset_get(excel_dataset_id)
            results['dataset_preview_excel'] = self.test_dataset_preview(excel_dataset_id)
            results['data_type_detection_excel'] = self.test_data_type_detection(excel_dataset_id)
            results['descriptive_analysis_excel'] = self.test_descriptive_analysis(excel_dataset_id)
            results['frequency_analysis_excel'] = self.test_frequency_analysis(excel_dataset_id, 'category')
            results['correlation_analysis_excel'] = self.test_correlation_analysis(excel_dataset_id)
        
        # Test with JSON dataset (employees data)
        if json_dataset_id:
            results['dataset_get_json'] = self.test_dataset_get(json_dataset_id)
            results['dataset_preview_json'] = self.test_dataset_preview(json_dataset_id)
            results['data_type_detection_json'] = self.test_data_type_detection(json_dataset_id)
            results['descriptive_analysis_json'] = self.test_descriptive_analysis(json_dataset_id)
            results['frequency_analysis_json'] = self.test_frequency_analysis(json_dataset_id, 'department')
            results['correlation_analysis_json'] = self.test_correlation_analysis(json_dataset_id)
        
        # Test dataset deletion (clean up)
        for dataset_id in self.uploaded_datasets:
            delete_key = f'dataset_delete_{dataset_id[:8]}'
            results[delete_key] = self.test_dataset_delete(dataset_id)
        
        # Print summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = 0
        failed = 0
        
        for test_name, result in results.items():
            status = "✓ PASS" if result else "✗ FAIL"
            print(f"{test_name:<35} {status}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\nTotal Tests: {len(results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(results)*100):.1f}%")
        
        return results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_comprehensive_test()