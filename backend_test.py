#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class IgnitionLabAPITester:
    def __init__(self, base_url="https://autotunedb.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'customers': [],
            'vehicles': [],
            'jobs': [],
            'billing': [],
            'reminders': [],
            'tune_revisions': []
        }

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json() if response.content else {}
            except:
                response_data = {"raw_response": response.text}
                
            if not success:
                response_data["status_code"] = response.status_code
                response_data["expected_status"] = expected_status
                
            return success, response_data
            
        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_authentication(self):
        """Test login with provided credentials"""
        print("\n🔐 Testing Authentication...")
        
        # Test login with correct credentials
        success, response = self.make_request(
            'POST', 
            'auth/login',
            {
                "username": "IgnitionLab Dynamics",
                "password": "IgnLabDyN@2025"
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.log_test("Admin Login", True, f"- Token received, Role: {response.get('role', 'N/A')}")
            
            # Test token validation
            success, me_response = self.make_request('GET', 'auth/me')
            self.log_test("Token Validation", success, f"- Username: {me_response.get('username', 'N/A')}")
            
            return True
        else:
            self.log_test("Admin Login", False, f"- {response}")
            return False

    def test_customer_management(self):
        """Test customer CRUD operations"""
        print("\n👥 Testing Customer Management...")
        
        # Create customer
        customer_data = {
            "full_name": "Test Customer",
            "phone_number": "+91-9876543210",
            "whatsapp_number": "+91-9876543210",
            "email": "test@example.com",
            "instagram_handle": "@testcustomer",
            "address": "123 Test Street, Test City",
            "gst_number": "29ABCDE1234F1Z5",
            "notes": "Test customer for API testing"
        }
        
        success, customer = self.make_request('POST', 'customers', customer_data, 200)
        if success and 'id' in customer:
            self.created_resources['customers'].append(customer['id'])
            self.log_test("Create Customer", True, f"- ID: {customer['id'][:8]}")
            
            # Get customer by ID
            success, retrieved = self.make_request('GET', f"customers/{customer['id']}")
            self.log_test("Get Customer by ID", success and retrieved.get('full_name') == customer_data['full_name'])
            
            # Update customer
            update_data = {**customer_data, "notes": "Updated notes"}
            success, updated = self.make_request('PUT', f"customers/{customer['id']}", update_data)
            self.log_test("Update Customer", success and updated.get('notes') == "Updated notes")
            
            # List all customers
            success, customers_list = self.make_request('GET', 'customers')
            self.log_test("List Customers", success and isinstance(customers_list, list))
            
            # Search customers
            success, search_results = self.make_request('GET', 'customers/search/Test')
            self.log_test("Search Customers", success and len(search_results) > 0)
            
            return customer['id']
        else:
            self.log_test("Create Customer", False, f"- {customer}")
            return None

    def test_vehicle_management(self, customer_id: str):
        """Test vehicle CRUD operations"""
        print("\n🚗 Testing Vehicle Management...")
        
        if not customer_id:
            self.log_test("Vehicle Management", False, "- No customer ID available")
            return None
            
        # Create vehicle
        vehicle_data = {
            "customer_id": customer_id,
            "make": "Maruti",
            "model": "Swift",
            "variant": "ZXi",
            "engine_code": "K12M",
            "ecu_type": "Bosch ME17.9.64",
            "vin": "MA3ERLF1S00123456",
            "registration_number": "MH01AB1234",
            "year": 2023,
            "fuel_type": "Petrol",
            "gearbox": "Manual",
            "odometer_at_last_visit": 15000,
            "notes": "Test vehicle for API testing"
        }
        
        success, vehicle = self.make_request('POST', 'vehicles', vehicle_data, 200)
        if success and 'id' in vehicle:
            self.created_resources['vehicles'].append(vehicle['id'])
            self.log_test("Create Vehicle", True, f"- ID: {vehicle['id'][:8]}, QR Code: {'✓' if vehicle.get('qr_code') else '✗'}")
            
            # Get vehicle by ID
            success, retrieved = self.make_request('GET', f"vehicles/{vehicle['id']}")
            self.log_test("Get Vehicle by ID", success and retrieved.get('make') == vehicle_data['make'])
            
            # Update vehicle
            update_data = {**vehicle_data, "notes": "Updated vehicle notes"}
            success, updated = self.make_request('PUT', f"vehicles/{vehicle['id']}", update_data)
            self.log_test("Update Vehicle", success and updated.get('notes') == "Updated vehicle notes")
            
            # List vehicles
            success, vehicles_list = self.make_request('GET', 'vehicles')
            self.log_test("List Vehicles", success and isinstance(vehicles_list, list))
            
            # List vehicles by customer
            success, customer_vehicles = self.make_request('GET', f'vehicles?customer_id={customer_id}')
            self.log_test("List Customer Vehicles", success and len(customer_vehicles) > 0)
            
            # Search vehicles
            success, search_results = self.make_request('GET', 'vehicles/search/Swift')
            self.log_test("Search Vehicles", success and len(search_results) > 0)
            
            return vehicle['id']
        else:
            self.log_test("Create Vehicle", False, f"- {vehicle}")
            return None

    def test_job_management(self, customer_id: str, vehicle_id: str):
        """Test job CRUD operations"""
        print("\n🔧 Testing Job Management...")
        
        if not customer_id or not vehicle_id:
            self.log_test("Job Management", False, "- Missing customer or vehicle ID")
            return None
            
        # Create job
        job_data = {
            "customer_id": customer_id,
            "vehicle_id": vehicle_id,
            "date": datetime.now().isoformat(),
            "technician_name": "Test Technician",
            "work_performed": "Stage 1 ECU Tune",
            "tune_stage": "Stage 1",
            "mods_installed": "Cold Air Intake, Exhaust System",
            "dyno_results": "150hp / 200Nm",
            "before_ecu_map_version": "Stock_v1.0",
            "after_ecu_map_version": "Stage1_v1.2",
            "calibration_notes": "Smooth power delivery, no knock detected",
            "road_test_notes": "Excellent throttle response",
            "next_recommendations": "Consider Stage 2 upgrade",
            "warranty_or_retune_status": "Under warranty",
            "odometer_at_visit": 15500
        }
        
        success, job = self.make_request('POST', 'jobs', job_data, 200)
        if success and 'id' in job:
            self.created_resources['jobs'].append(job['id'])
            self.log_test("Create Job", True, f"- ID: {job['id'][:8]}")
            
            # Get job by ID
            success, retrieved = self.make_request('GET', f"jobs/{job['id']}")
            self.log_test("Get Job by ID", success and retrieved.get('technician_name') == job_data['technician_name'])
            
            # Update job
            update_data = {**job_data, "work_performed": "Updated work description"}
            success, updated = self.make_request('PUT', f"jobs/{job['id']}", update_data)
            self.log_test("Update Job", success and updated.get('work_performed') == "Updated work description")
            
            # List jobs
            success, jobs_list = self.make_request('GET', 'jobs')
            self.log_test("List Jobs", success and isinstance(jobs_list, list))
            
            # List jobs by vehicle
            success, vehicle_jobs = self.make_request('GET', f'jobs?vehicle_id={vehicle_id}')
            self.log_test("List Vehicle Jobs", success and len(vehicle_jobs) > 0)
            
            return job['id']
        else:
            self.log_test("Create Job", False, f"- {job}")
            return None

    def test_billing_management(self, job_id: str):
        """Test billing CRUD operations"""
        print("\n💰 Testing Billing Management...")
        
        if not job_id:
            self.log_test("Billing Management", False, "- No job ID available")
            return None
            
        # Create billing
        billing_data = {
            "job_id": job_id,
            "quoted_amount": 25000.0,
            "final_billed_amount": 23000.0,
            "payment_method": "upi",
            "payment_status": "paid",
            "gst_invoice_number": "INV-2025-001",
            "discounts": 2000.0,
            "notes": "Early payment discount applied"
        }
        
        success, billing = self.make_request('POST', 'billing', billing_data, 200)
        if success and 'id' in billing:
            self.created_resources['billing'].append(billing['id'])
            self.log_test("Create Billing", True, f"- ID: {billing['id'][:8]}, Amount: ₹{billing.get('final_billed_amount', 0)}")
            
            # Update billing
            update_data = {**billing_data, "payment_status": "partial"}
            success, updated = self.make_request('PUT', f"billing/{billing['id']}", update_data)
            self.log_test("Update Billing", success and updated.get('payment_status') == "partial")
            
            # List billing records
            success, billing_list = self.make_request('GET', 'billing')
            self.log_test("List Billing Records", success and isinstance(billing_list, list))
            
            # List billing by job
            success, job_billing = self.make_request('GET', f'billing?job_id={job_id}')
            self.log_test("List Job Billing", success and len(job_billing) > 0)
            
            return billing['id']
        else:
            self.log_test("Create Billing", False, f"- {billing}")
            return None

    def test_tune_revisions(self, job_id: str, vehicle_id: str):
        """Test tune revision management"""
        print("\n🎛️ Testing Tune Revisions...")
        
        if not job_id or not vehicle_id:
            self.log_test("Tune Revisions", False, "- Missing job or vehicle ID")
            return None
            
        # Create tune revision
        revision_data = {
            "job_id": job_id,
            "vehicle_id": vehicle_id,
            "revision_label": "v1.2.1",
            "description": "Minor timing adjustments for better fuel economy",
            "diff_notes": "Adjusted ignition timing by 2 degrees"
        }
        
        success, revision = self.make_request('POST', 'tune-revisions', revision_data, 200)
        if success and 'id' in revision:
            self.created_resources['tune_revisions'].append(revision['id'])
            self.log_test("Create Tune Revision", True, f"- ID: {revision['id'][:8]}, Label: {revision.get('revision_label')}")
            
            # List tune revisions by vehicle
            success, vehicle_revisions = self.make_request('GET', f'tune-revisions?vehicle_id={vehicle_id}')
            self.log_test("List Vehicle Tune Revisions", success and len(vehicle_revisions) > 0)
            
            # List tune revisions by job
            success, job_revisions = self.make_request('GET', f'tune-revisions?job_id={job_id}')
            self.log_test("List Job Tune Revisions", success and len(job_revisions) > 0)
            
            return revision['id']
        else:
            self.log_test("Create Tune Revision", False, f"- {revision}")
            return None

    def test_reminders_management(self, customer_id: str, vehicle_id: str, job_id: str):
        """Test reminders CRUD operations"""
        print("\n🔔 Testing Reminders Management...")
        
        if not customer_id or not vehicle_id:
            self.log_test("Reminders Management", False, "- Missing customer or vehicle ID")
            return None
            
        # Create reminder
        reminder_date = (datetime.now() + timedelta(days=30)).isoformat()
        reminder_data = {
            "customer_id": customer_id,
            "vehicle_id": vehicle_id,
            "job_id": job_id,
            "reminder_type": "follow_up",
            "reminder_date": reminder_date,
            "message": "Follow-up call for tune feedback"
        }
        
        success, reminder = self.make_request('POST', 'reminders', reminder_data, 200)
        if success and 'id' in reminder:
            self.created_resources['reminders'].append(reminder['id'])
            self.log_test("Create Reminder", True, f"- ID: {reminder['id'][:8]}, Type: {reminder.get('reminder_type')}")
            
            # List all reminders
            success, reminders_list = self.make_request('GET', 'reminders')
            self.log_test("List All Reminders", success and isinstance(reminders_list, list))
            
            # List pending reminders
            success, pending_reminders = self.make_request('GET', 'reminders?status=pending')
            self.log_test("List Pending Reminders", success and len(pending_reminders) > 0)
            
            # Update reminder status
            success, updated = self.make_request('PUT', f'reminders/{reminder["id"]}?status=completed')
            self.log_test("Update Reminder Status", success and updated.get('status') == 'completed')
            
            return reminder['id']
        else:
            self.log_test("Create Reminder", False, f"- {reminder}")
            return None

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n📊 Testing Dashboard Stats...")
        
        success, stats = self.make_request('GET', 'dashboard/stats')
        if success:
            required_fields = ['jobs_this_week', 'pending_payments', 'upcoming_reminders', 'total_customers', 'total_vehicles', 'recent_jobs']
            all_fields_present = all(field in stats for field in required_fields)
            self.log_test("Dashboard Stats", all_fields_present, f"- Fields: {list(stats.keys())}")
            
            # Verify data types
            numeric_fields = ['jobs_this_week', 'pending_payments', 'upcoming_reminders', 'total_customers', 'total_vehicles']
            numeric_valid = all(isinstance(stats.get(field, 0), int) for field in numeric_fields)
            self.log_test("Dashboard Stats Data Types", numeric_valid)
            
            return True
        else:
            self.log_test("Dashboard Stats", False, f"- {stats}")
            return False

    def test_global_search(self):
        """Test global search functionality"""
        print("\n🔍 Testing Global Search...")
        
        # Search for test data
        success, search_results = self.make_request('GET', 'search/Test')
        if success:
            has_customers = 'customers' in search_results and isinstance(search_results['customers'], list)
            has_vehicles = 'vehicles' in search_results and isinstance(search_results['vehicles'], list)
            self.log_test("Global Search Structure", has_customers and has_vehicles)
            
            # Search for specific terms
            success, phone_search = self.make_request('GET', 'search/9876543210')
            self.log_test("Search by Phone", success)
            
            success, reg_search = self.make_request('GET', 'search/MH01AB1234')
            self.log_test("Search by Registration", success)
            
            return True
        else:
            self.log_test("Global Search", False, f"- {search_results}")
            return False

    def test_file_upload(self):
        """Test file upload functionality"""
        print("\n📁 Testing File Upload...")
        
        # Create a test file
        test_content = "Test file content for IgnitionLab Dynamics"
        files = {'file': ('test.txt', test_content, 'text/plain')}
        
        url = f"{self.base_url}/api/upload"
        headers = {'Authorization': f'Bearer {self.token}'} if self.token else {}
        
        try:
            response = requests.post(url, files=files, headers=headers, timeout=30)
            success = response.status_code == 200
            
            if success:
                upload_data = response.json()
                file_id = upload_data.get('file_id')
                self.log_test("File Upload", True, f"- File ID: {file_id}")
                
                # Test file retrieval
                if file_id:
                    success, _ = self.make_request('GET', f'uploads/{file_id}')
                    self.log_test("File Retrieval", success)
                
                return True
            else:
                self.log_test("File Upload", False, f"- Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("File Upload", False, f"- Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting IgnitionLab Dynamics API Test Suite")
        print("=" * 60)
        
        # Authentication is required for all other tests
        if not self.test_authentication():
            print("\n❌ Authentication failed - stopping tests")
            return False
            
        # Test core functionality
        customer_id = self.test_customer_management()
        vehicle_id = self.test_vehicle_management(customer_id)
        job_id = self.test_job_management(customer_id, vehicle_id)
        
        # Test related functionality
        self.test_billing_management(job_id)
        self.test_tune_revisions(job_id, vehicle_id)
        self.test_reminders_management(customer_id, vehicle_id, job_id)
        
        # Test dashboard and search
        self.test_dashboard_stats()
        self.test_global_search()
        self.test_file_upload()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📋 TEST SUMMARY")
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.created_resources:
            print(f"\n📦 Created Resources:")
            for resource_type, ids in self.created_resources.items():
                if ids:
                    print(f"  {resource_type}: {len(ids)} items")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = IgnitionLabAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())