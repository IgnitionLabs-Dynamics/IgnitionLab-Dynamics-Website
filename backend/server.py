from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import qrcode
from io import BytesIO
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-this-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# File upload directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# ==================== AUTH UTILITIES ====================
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"username": username}, {"_id": 0})
    if user is None:
        raise credentials_exception
    return user

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    hashed_password: str
    role: str = "admin"  # admin, technician, viewer
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str

class Customer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    phone_number: str
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None
    instagram_handle: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    id_proof_reference: Optional[str] = None
    consent_docs_reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class CustomerCreate(BaseModel):
    full_name: str
    phone_number: str
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None
    instagram_handle: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    notes: Optional[str] = None

class Vehicle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    make: str
    model: str
    variant: str
    engine_code: str
    ecu_type: str
    vin: str
    registration_number: str
    year: int
    fuel_type: str
    gearbox: str
    odometer_at_last_visit: Optional[int] = None
    notes: Optional[str] = None
    qr_code: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class VehicleCreate(BaseModel):
    customer_id: str
    make: str
    model: str
    variant: str
    engine_code: str
    ecu_type: str
    vin: str
    registration_number: str
    year: int
    fuel_type: str
    gearbox: str
    odometer_at_last_visit: Optional[int] = None
    notes: Optional[str] = None

class Job(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    customer_id: str
    date: str
    technician_name: str
    work_performed: Optional[str] = None
    tune_stage: Optional[str] = None
    mods_installed: Optional[str] = None
    dyno_results: Optional[str] = None
    before_ecu_map_version: Optional[str] = None
    after_ecu_map_version: Optional[str] = None
    files_uploaded: Optional[List[str]] = None
    afr_graph_screenshots: Optional[List[str]] = None
    calibration_notes: Optional[str] = None
    road_test_notes: Optional[str] = None
    next_recommendations: Optional[str] = None
    warranty_or_retune_status: Optional[str] = None
    odometer_at_visit: Optional[int] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class JobCreate(BaseModel):
    vehicle_id: str
    customer_id: str
    date: str
    technician_name: str
    work_performed: Optional[str] = None
    tune_stage: Optional[str] = None
    mods_installed: Optional[str] = None
    dyno_results: Optional[str] = None
    before_ecu_map_version: Optional[str] = None
    after_ecu_map_version: Optional[str] = None
    calibration_notes: Optional[str] = None
    road_test_notes: Optional[str] = None
    next_recommendations: Optional[str] = None
    warranty_or_retune_status: Optional[str] = None
    odometer_at_visit: Optional[int] = None

class TuneRevision(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    vehicle_id: str
    revision_label: str
    description: Optional[str] = None
    base_file_reference: Optional[str] = None
    diff_notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class TuneRevisionCreate(BaseModel):
    job_id: str
    vehicle_id: str
    revision_label: str
    description: Optional[str] = None
    diff_notes: Optional[str] = None

class Billing(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    quoted_amount: float
    final_billed_amount: float
    payment_method: str
    payment_status: str  # paid, pending, partial
    gst_invoice_number: Optional[str] = None
    discounts: Optional[float] = None
    refunds: Optional[float] = None
    notes: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BillingCreate(BaseModel):
    job_id: str
    quoted_amount: float
    final_billed_amount: float
    payment_method: str
    payment_status: str
    gst_invoice_number: Optional[str] = None
    discounts: Optional[float] = None
    refunds: Optional[float] = None
    notes: Optional[str] = None

class Reminder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_id: str
    customer_id: str
    job_id: Optional[str] = None
    reminder_type: str  # follow_up, service, retune
    reminder_date: str
    message: str
    status: str = "pending"  # pending, completed, cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ReminderCreate(BaseModel):
    vehicle_id: str
    customer_id: str
    job_id: Optional[str] = None
    reminder_type: str
    reminder_date: str
    message: str

class Appointment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    vehicle_id: str
    appointment_date: str
    appointment_time: str
    service_type: str
    notes: Optional[str] = None
    status: str = "scheduled"  # scheduled, confirmed, completed, cancelled
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AppointmentCreate(BaseModel):
    customer_id: str
    vehicle_id: str
    appointment_date: str
    appointment_time: str
    service_type: str
    notes: Optional[str] = None
    status: str = "scheduled"

class StatusUpdate(BaseModel):
    status: str

class DashboardStats(BaseModel):
    jobs_this_week: int
    pending_payments: int
    upcoming_reminders: int
    total_customers: int
    total_vehicles: int
    recent_jobs: List[dict]

# ==================== INITIALIZE DEFAULT ADMIN ====================
@app.on_event("startup")
async def startup_event():
    # Create default admin user if not exists
    admin_exists = await db.users.find_one({"username": "IgnitionLab Dynamics"})
    if not admin_exists:
        admin_user = User(
            username="IgnitionLab Dynamics",
            hashed_password=get_password_hash("IgnLabDyN@2025"),
            role="admin"
        )
        await db.users.insert_one(admin_user.model_dump())
        logger.info("Default admin user created")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/login", response_model=Token)
async def login(user_login: UserLogin):
    user = await db.users.find_one({"username": user_login.username}, {"_id": 0})
    if not user or not verify_password(user_login.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user["username"],
        "role": user["role"]
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"], "role": current_user["role"]}

@api_router.post("/auth/register")
async def register(user_login: UserLogin):
    # Check if username already exists
    existing_user = await db.users.find_one({"username": user_login.username}, {"_id": 0})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Create new user with technician role by default
    new_user = User(
        username=user_login.username,
        hashed_password=get_password_hash(user_login.password),
        role="technician"  # Default role for new registrations
    )
    await db.users.insert_one(new_user.model_dump())
    
    return {"message": "User created successfully", "username": new_user.username}

# ==================== USER MANAGEMENT ROUTES (ADMIN ONLY) ====================

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "technician"

class RoleUpdate(BaseModel):
    role: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    username: str
    role: str
    created_at: str

@api_router.get("/users", response_model=List[UserResponse])
async def get_users(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    users = await db.users.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
    return users

@api_router.post("/users", response_model=UserResponse)
async def create_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if username already exists
    existing_user = await db.users.find_one({"username": user_data.username}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = User(
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        role=user_data.role
    )
    await db.users.insert_one(new_user.model_dump())
    
    # Return without password
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        role=new_user.role,
        created_at=new_user.created_at
    )

@api_router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, role_update: RoleUpdate, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"role": role_update.role}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User role updated successfully"}

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Prevent deleting the default admin
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user and user["username"] == "IgnitionLab Dynamics":
        raise HTTPException(status_code=400, detail="Cannot delete default admin user")
    
    result = await db.users.delete_one({"id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

# ==================== CUSTOMER ROUTES ====================

@api_router.post("/customers", response_model=Customer)
async def create_customer(customer: CustomerCreate, current_user: dict = Depends(get_current_user)):
    customer_obj = Customer(**customer.model_dump())
    await db.customers.insert_one(customer_obj.model_dump())
    return customer_obj

@api_router.get("/customers", response_model=List[Customer])
async def get_customers(current_user: dict = Depends(get_current_user)):
    customers = await db.customers.find({}, {"_id": 0}).to_list(1000)
    return customers

@api_router.get("/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@api_router.put("/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_update: CustomerCreate, current_user: dict = Depends(get_current_user)):
    update_data = customer_update.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.customers.update_one(
        {"id": customer_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = await db.customers.find_one({"id": customer_id}, {"_id": 0})
    return customer

@api_router.get("/customers/search/{query}")
async def search_customers(query: str, current_user: dict = Depends(get_current_user)):
    customers = await db.customers.find(
        {
            "$or": [
                {"full_name": {"$regex": query, "$options": "i"}},
                {"phone_number": {"$regex": query, "$options": "i"}},
                {"email": {"$regex": query, "$options": "i"}}
            ]
        },
        {"_id": 0}
    ).to_list(100)
    return customers

@api_router.delete("/customers/{customer_id}")
async def delete_customer(customer_id: str, current_user: dict = Depends(get_current_user)):
    # Check if customer has vehicles
    vehicles = await db.vehicles.find({"customer_id": customer_id}).to_list(10)
    if vehicles:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete customer. Please delete {len(vehicles)} associated vehicle(s) first."
        )
    
    result = await db.customers.delete_one({"id": customer_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return {"message": "Customer deleted successfully"}

# ==================== VEHICLE ROUTES ====================

@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(vehicle: VehicleCreate, current_user: dict = Depends(get_current_user)):
    vehicle_obj = Vehicle(**vehicle.model_dump())
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    # Use environment variable for frontend URL, fallback to localhost for development
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    qr_data = f"{frontend_url}/vehicles/{vehicle_obj.id}"
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    qr_code_base64 = base64.b64encode(buffered.getvalue()).decode()
    
    vehicle_obj.qr_code = f"data:image/png;base64,{qr_code_base64}"
    
    await db.vehicles.insert_one(vehicle_obj.model_dump())
    return vehicle_obj

@api_router.get("/vehicles", response_model=List[Vehicle])
async def get_vehicles(customer_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"customer_id": customer_id} if customer_id else {}
    vehicles = await db.vehicles.find(query, {"_id": 0}).to_list(1000)
    return vehicles

@api_router.get("/vehicles/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str, current_user: dict = Depends(get_current_user)):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@api_router.put("/vehicles/{vehicle_id}", response_model=Vehicle)
async def update_vehicle(vehicle_id: str, vehicle_update: VehicleCreate, current_user: dict = Depends(get_current_user)):
    update_data = vehicle_update.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.vehicles.update_one(
        {"id": vehicle_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    return vehicle

@api_router.get("/vehicles/search/{query}")
async def search_vehicles(query: str, current_user: dict = Depends(get_current_user)):
    vehicles = await db.vehicles.find(
        {
            "$or": [
                {"registration_number": {"$regex": query, "$options": "i"}},
                {"vin": {"$regex": query, "$options": "i"}},
                {"make": {"$regex": query, "$options": "i"}},
                {"model": {"$regex": query, "$options": "i"}}
            ]
        },
        {"_id": 0}
    ).to_list(100)
    return vehicles

@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, current_user: dict = Depends(get_current_user)):
    # Check if vehicle has jobs
    jobs = await db.jobs.find({"vehicle_id": vehicle_id}).to_list(10)
    if jobs:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete vehicle. Please delete {len(jobs)} associated job(s) first."
        )
    
    # Delete associated tune revisions and reminders
    await db.tune_revisions.delete_many({"vehicle_id": vehicle_id})
    await db.reminders.delete_many({"vehicle_id": vehicle_id})
    await db.appointments.delete_many({"vehicle_id": vehicle_id})
    
    result = await db.vehicles.delete_one({"id": vehicle_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return {"message": "Vehicle deleted successfully"}

# ==================== JOB ROUTES ====================

@api_router.post("/jobs", response_model=Job)
async def create_job(job: JobCreate, current_user: dict = Depends(get_current_user)):
    job_obj = Job(**job.model_dump())
    
    # Update vehicle's odometer
    if job_obj.odometer_at_visit:
        await db.vehicles.update_one(
            {"id": job_obj.vehicle_id},
            {"$set": {"odometer_at_last_visit": job_obj.odometer_at_visit}}
        )
    
    await db.jobs.insert_one(job_obj.model_dump())
    return job_obj

@api_router.get("/jobs", response_model=List[Job])
async def get_jobs(vehicle_id: Optional[str] = None, customer_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if vehicle_id:
        query["vehicle_id"] = vehicle_id
    if customer_id:
        query["customer_id"] = customer_id
    
    jobs = await db.jobs.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return jobs

@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(job_id: str, current_user: dict = Depends(get_current_user)):
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@api_router.put("/jobs/{job_id}", response_model=Job)
async def update_job(job_id: str, job_update: JobCreate, current_user: dict = Depends(get_current_user)):
    update_data = job_update.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Update vehicle's odometer if provided
    if job_update.odometer_at_visit:
        await db.vehicles.update_one(
            {"id": job_update.vehicle_id},
            {"$set": {"odometer_at_last_visit": job_update.odometer_at_visit}}
        )
    
    result = await db.jobs.update_one(
        {"id": job_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = await db.jobs.find_one({"id": job_id}, {"_id": 0})
    return job

@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, current_user: dict = Depends(get_current_user)):
    # Delete associated tune revisions and billing
    await db.tune_revisions.delete_many({"job_id": job_id})
    await db.billing.delete_many({"job_id": job_id})
    
    result = await db.jobs.delete_one({"id": job_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {"message": "Job deleted successfully"}

# ==================== TUNE REVISION ROUTES ====================

@api_router.post("/tune-revisions", response_model=TuneRevision)
async def create_tune_revision(revision: TuneRevisionCreate, current_user: dict = Depends(get_current_user)):
    revision_obj = TuneRevision(**revision.model_dump())
    await db.tune_revisions.insert_one(revision_obj.model_dump())
    return revision_obj

@api_router.get("/tune-revisions", response_model=List[TuneRevision])
async def get_tune_revisions(vehicle_id: Optional[str] = None, job_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if vehicle_id:
        query["vehicle_id"] = vehicle_id
    if job_id:
        query["job_id"] = job_id
    
    revisions = await db.tune_revisions.find(query, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return revisions

class TuneRevisionUpdate(BaseModel):
    revision_label: str
    description: Optional[str] = None
    diff_notes: Optional[str] = None

@api_router.put("/tune-revisions/{revision_id}", response_model=TuneRevision)
async def update_tune_revision(revision_id: str, revision_update: TuneRevisionUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {
        "revision_label": revision_update.revision_label,
        "description": revision_update.description,
        "diff_notes": revision_update.diff_notes,
    }
    
    result = await db.tune_revisions.update_one(
        {"id": revision_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tune revision not found")
    
    revision = await db.tune_revisions.find_one({"id": revision_id}, {"_id": 0})
    return revision

# ==================== BILLING ROUTES ====================

@api_router.post("/billing", response_model=Billing)
async def create_billing(billing: BillingCreate, current_user: dict = Depends(get_current_user)):
    billing_obj = Billing(**billing.model_dump())
    await db.billing.insert_one(billing_obj.model_dump())
    return billing_obj

@api_router.get("/billing", response_model=List[Billing])
async def get_billing(job_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"job_id": job_id} if job_id else {}
    billing = await db.billing.find(query, {"_id": 0}).to_list(1000)
    return billing

@api_router.put("/billing/{billing_id}", response_model=Billing)
async def update_billing(billing_id: str, billing_update: BillingCreate, current_user: dict = Depends(get_current_user)):
    update_data = billing_update.model_dump()
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.billing.update_one(
        {"id": billing_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Billing record not found")
    
    billing = await db.billing.find_one({"id": billing_id}, {"_id": 0})
    return billing

# ==================== REMINDER ROUTES ====================

@api_router.post("/reminders", response_model=Reminder)
async def create_reminder(reminder: ReminderCreate, current_user: dict = Depends(get_current_user)):
    reminder_obj = Reminder(**reminder.model_dump())
    await db.reminders.insert_one(reminder_obj.model_dump())
    return reminder_obj

@api_router.get("/reminders", response_model=List[Reminder])
async def get_reminders(status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"status": status} if status else {}
    reminders = await db.reminders.find(query, {"_id": 0}).sort("reminder_date", 1).to_list(1000)
    return reminders

@api_router.put("/reminders/{reminder_id}", response_model=Reminder)
async def update_reminder_status(reminder_id: str, status: str, current_user: dict = Depends(get_current_user)):
    result = await db.reminders.update_one(
        {"id": reminder_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminder = await db.reminders.find_one({"id": reminder_id}, {"_id": 0})
    return reminder

# ==================== APPOINTMENT ROUTES ====================

@api_router.post("/appointments", response_model=Appointment)
async def create_appointment(appointment: AppointmentCreate, current_user: dict = Depends(get_current_user)):
    appointment_obj = Appointment(**appointment.model_dump())
    await db.appointments.insert_one(appointment_obj.model_dump())
    return appointment_obj

@api_router.get("/appointments", response_model=List[Appointment])
async def get_appointments(current_user: dict = Depends(get_current_user)):
    appointments = await db.appointments.find({}, {"_id": 0}).sort("appointment_date", 1).to_list(1000)
    return appointments

@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status_update: StatusUpdate, current_user: dict = Depends(get_current_user)):
    result = await db.appointments.update_one(
        {"id": appointment_id},
        {"$set": {"status": status_update.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": "Appointment status updated successfully"}

@api_router.delete("/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.appointments.delete_one({"id": appointment_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return {"message": "Appointment deleted successfully"}

# ==================== DASHBOARD STATS ====================

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # Jobs this week
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    jobs_this_week = await db.jobs.count_documents({"date": {"$gte": week_ago}})
    
    # Pending payments
    pending_payments = await db.billing.count_documents({"payment_status": {"$in": ["pending", "partial"]}})
    
    # Upcoming reminders
    today = datetime.now(timezone.utc).isoformat()
    upcoming_reminders = await db.reminders.count_documents({
        "status": "pending",
        "reminder_date": {"$gte": today}
    })
    
    # Total counts
    total_customers = await db.customers.count_documents({})
    total_vehicles = await db.vehicles.count_documents({})
    
    # Recent jobs
    recent_jobs = await db.jobs.find({}, {"_id": 0}).sort("date", -1).limit(5).to_list(5)
    
    return {
        "jobs_this_week": jobs_this_week,
        "pending_payments": pending_payments,
        "upcoming_reminders": upcoming_reminders,
        "total_customers": total_customers,
        "total_vehicles": total_vehicles,
        "recent_jobs": recent_jobs
    }

# ==================== FILE UPLOAD ====================

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    file_id = str(uuid.uuid4())
    file_extension = Path(file.filename).suffix
    file_path = UPLOAD_DIR / f"{file_id}{file_extension}"
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return {"file_id": file_id, "filename": file.filename, "path": str(file_path)}

@api_router.get("/uploads/{file_id}")
async def get_file(file_id: str, current_user: dict = Depends(get_current_user)):
    # Find file with any extension
    for file_path in UPLOAD_DIR.glob(f"{file_id}.*"):
        return FileResponse(file_path)
    
    raise HTTPException(status_code=404, detail="File not found")

# ==================== GLOBAL SEARCH ====================

@api_router.get("/search/{query}")
async def global_search(query: str, current_user: dict = Depends(get_current_user)):
    customers = await db.customers.find(
        {
            "$or": [
                {"full_name": {"$regex": query, "$options": "i"}},
                {"phone_number": {"$regex": query, "$options": "i"}}
            ]
        },
        {"_id": 0}
    ).limit(5).to_list(5)
    
    vehicles = await db.vehicles.find(
        {
            "$or": [
                {"registration_number": {"$regex": query, "$options": "i"}},
                {"vin": {"$regex": query, "$options": "i"}},
                {"make": {"$regex": query, "$options": "i"}},
                {"model": {"$regex": query, "$options": "i"}}
            ]
        },
        {"_id": 0}
    ).limit(5).to_list(5)
    
    return {
        "customers": customers,
        "vehicles": vehicles
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()