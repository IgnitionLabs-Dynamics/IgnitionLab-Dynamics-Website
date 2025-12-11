# IgnitionLab Dynamics - Vehicle Management System

A comprehensive, production-ready web application for managing vehicle servicing, tuning jobs, customer records, and workshop operations.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with role management (Admin, Technician)
- **Customer Management**: Complete customer database with contact details and history
- **Vehicle Tracking**: Detailed vehicle records with QR codes and technical specifications
- **Job Management**: Track all tuning jobs, services, and modifications
- **Tune Revisions**: Version control for tune files and calibration changes
- **Billing & Payments**: Invoice tracking with payment status monitoring
- **Dashboard Analytics**: Real-time stats and insights with clickable navigation
- **Revenue Overview** (Admin Only): Track income by calendar week, calendar month, and all-time from paid invoices
- **Live Clock**: Real-time date and time display in header for temporal awareness
- **Filtered Views**: Quick access to jobs this week and pending payments
- **Appointments & Reminders**: Schedule management system
- **User Profile Management**: Change username and password
- **Enhanced Search**: Search by customer, phone, VIN, registration, engine code, and ECU type
- **Editable Customer Details**: Modify customer information directly from detail pages
- **Interactive Dashboard Cards**: Click-through navigation from dashboard widgets

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt password hashing (v3.2.2)
- **Structure**: Organized modular architecture
  - `/backend/models/` - Pydantic data models
  - `/backend/utils/` - Authentication and utility functions
  - `/backend/server.py` - API routes and business logic

### Frontend
- **Framework**: React (Create React App)
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: Shadcn/UI
- **Routing**: React Router
- **State Management**: Context API (Auth)
- **Notifications**: Sonner toast notifications
- **PDF Generation**: jsPDF
- **QR Codes**: qrcode library

## 📁 Project Structure

```
/app/
├── backend/
│   ├── models/          # Pydantic data models (organized by entity)
│   │   ├── user.py
│   │   ├── customer.py
│   │   ├── vehicle.py
│   │   ├── job.py
│   │   ├── tune_revision.py
│   │   ├── billing.py
│   │   ├── reminder.py
│   │   ├── appointment.py
│   │   └── dashboard.py
│   ├── utils/           # Utility functions
│   │   └── auth.py      # Authentication helpers
│   ├── server.py        # Main API application
│   ├── .env             # Environment variables
│   └── requirements.txt # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── contexts/    # React contexts (Auth)
    │   ├── lib/         # Utilities (API client, helpers)
    │   └── pages/       # Application pages
    ├── .env             # Environment variables
    └── package.json     # Node dependencies
```

## 🚦 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- **Windows**: Git Bash or WSL2 (recommended) for running bash commands
- **Linux/macOS**: Terminal with bash

### Environment Variables

**Backend** (`/app/backend/.env`):
```env
MONGO_URL=<mongodb_connection_string>
DB_NAME=<database_name>
SECRET_KEY=<your_secret_key>
FRONTEND_URL=<frontend_url>
CORS_ORIGINS=*
```

**Frontend** (`/app/frontend/.env`):
```env
REACT_APP_BACKEND_URL=<backend_api_url>
```

### Installation & Running

#### **Option 1: Production Environment (Kubernetes/Docker)**

The application runs in a Kubernetes environment with hot reload enabled:

**Backend**: 
- Runs on `http://0.0.0.0:8001`
- Auto-reloads on code changes
- Managed by Supervisor

**Frontend**: 
- Runs on `http://localhost:3000`
- Auto-reloads on code changes
- Managed by Supervisor

**Restart services** (only needed after .env changes or dependency installation):

**Linux/macOS:**
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

**Check status:**
```bash
sudo supervisorctl status
```

**View logs:**
```bash
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log
```

#### **Option 2: Local Development (Windows/Linux/macOS)**

**1. Install MongoDB**

**Windows:**
- Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
- Install and start MongoDB service
- Default connection: `mongodb://localhost:27017`

**Linux:**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**2. Set up Backend**

**Windows (PowerShell/Command Prompt):**
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Linux/macOS:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Create `.env` file** in `/backend/` with:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=ignitionlab_db
SECRET_KEY=your-secret-key-here-change-in-production
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=*
```

**Run Backend:**

**Windows:**
```cmd
venv\Scripts\activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Linux/macOS:**
```bash
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**3. Set up Frontend**

**Windows (PowerShell/Command Prompt):**
```cmd
cd frontend
npm install
```
Or use Yarn:
```cmd
yarn install
```

**Linux/macOS:**
```bash
cd frontend
npm install
# or
yarn install
```

**Create `.env` file** in `/frontend/` with:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Run Frontend:**

**Windows:**
```cmd
npm start
```
Or with Yarn:
```cmd
yarn start
```

**Linux/macOS:**
```bash
npm start
# or
yarn start
```

**4. Access Application**

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8001`
- API Documentation: `http://localhost:8001/docs`

**5. Verify Installation**

Open your browser and navigate to `http://localhost:3000`. You should see the login page.

**Troubleshooting:**

**Windows-Specific Issues:**

1. **Port Already in Use:**
   - Check what's using port 3000: `netstat -ano | findstr :3000`
   - Kill process: `taskkill /PID <process_id> /F`
   - For port 8001: `netstat -ano | findstr :8001`

2. **MongoDB Connection Error:**
   - Verify MongoDB is running: Check Services (Win + R, type `services.msc`)
   - Look for "MongoDB Server" service
   - If not running, start it

3. **Python Virtual Environment:**
   - If `venv\Scripts\activate` doesn't work, try: `venv\Scripts\activate.bat`
   - Or use: `python -m venv venv --clear` to recreate

4. **Node/NPM Errors:**
   - Clear cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, then reinstall

**Linux/macOS Issues:**

1. **Permission Errors:**
   ```bash
   sudo chown -R $USER:$USER /path/to/project
   ```

2. **Port in Use:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   lsof -ti:8001 | xargs kill -9
   ```

## 👤 Default Credentials

**Admin Account**:
- **Username**: `admin`
- **Password**: `admin`

> ⚠️ **Important**: Change the default password immediately after first login for security.

## 📊 Key API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/users/me/username` - Update current user's username
- `PUT /api/users/me/password` - Update current user's password

### Resources (all require authentication)
- `GET/POST /api/customers` - Customer management
- `PUT /api/customers/{id}` - Update customer details
- `GET/POST /api/vehicles` - Vehicle management
- `GET/POST /api/jobs` - Job management
- `GET/POST /api/tune-revisions` - Tune revision tracking
- `GET/POST /api/billing` - Billing records
- `GET/POST /api/appointments` - Appointment scheduling
- `GET/POST /api/reminders` - Reminder management
- `GET /api/dashboard/stats` - Dashboard statistics (includes income analytics)
- `GET /api/search?q=<query>` - Global search across customers, vehicles

### Health Checks
- `GET /api/health` - Basic health check
- `GET /api/readiness` - Readiness probe for deployments

### Admin Only
- `GET/POST /api/users` - User management
- `DELETE /api/users/{id}` - Delete user

## 🔐 Security Features

- JWT-based authentication with 24-hour token expiry
- Bcrypt password hashing (v3.2.2 for compatibility)
- Role-based access control (Admin, Technician)
- Protected API endpoints
- CORS configuration
- Secure password change functionality
- **Revenue visibility**: Financial data (Revenue Overview) restricted to admin role only
- User management restricted to admin role only

## 📱 Frontend Pages

- **Login**: Secure authentication with clean UI
- **Dashboard**: Overview with stats, revenue tracking, and quick access widgets with click-through navigation
- **Jobs**: Filtered views (This Week, Pending Payments, All)
- **Customers**: Customer database management with editable details
- **Customer Detail**: View and edit customer information
- **Vehicles**: Vehicle database with QR codes (no VIN length restriction)
- **Vehicle Detail**: Complete vehicle history, jobs, tune revisions, PDF export
- **Appointments**: Scheduling system
- **Reminders**: Follow-up and service reminder tracking
- **Profile**: Change username and password
- **Search Results**: Display all matches from global search
- **User Management** (Admin): User account management

## 🎨 UI/UX Features

- Dark theme optimized for professional use
- Responsive design (mobile-friendly)
- Interactive dashboard widgets with click-through navigation
- Revenue overview card with calendar-based period toggling (This Week/This Month/All-Time)
- Live date and time display in header (updates every second)
- Clickable recent job cards that navigate to vehicle details
- Real-time toast notifications
- QR code generation for vehicle records
- PDF export for complete vehicle history
- Form validation and error handling
- Global search bar in header
- Profile menu in header navigation
- Hover states and visual feedback on interactive elements
- Calendar-aware calculations (weeks start Monday, months follow calendar)

## 📝 Code Architecture Highlights

### Backend Best Practices
✅ Modular structure with organized models and utilities  
✅ Async/await pattern for database operations  
✅ Proper error handling with HTTP exceptions  
✅ MongoDB best practices (excluding `_id`, proper indexing)  
✅ Environment variable configuration  
✅ Timezone-aware datetime handling  
✅ Health check endpoints for production deployments  
✅ Dependency version pinning for stability  

### Frontend Best Practices
✅ Component-based architecture  
✅ Custom hooks for API calls  
✅ Context API for global auth state  
✅ Utility functions for formatting (dates, currency)  
✅ Consistent styling with Tailwind  
✅ Accessible UI components (Shadcn)  
✅ Clean, minimal design  

## 🔄 Recent Updates (December 2025)

### Major Features Added:
1. **User Profile Management**:
   - Users can change their username and password
   - Accessible via "Profile" link in header menu

2. **Enhanced Global Search**:
   - Now searches engine code and ECU type in addition to customer/vehicle info
   - Results displayed on dedicated `/search` page showing all matches
   - No longer auto-navigates to first result

3. **Customer Detail Editing**:
   - "Edit Details" button on customer detail page
   - Modal form for editing customer information

4. **Dashboard Widget Filtering**: 
   - "Jobs This Week" now filters to current calendar week (Monday-Sunday)
   - "Pending Payments" shows jobs with pending/partial payment status
   - New `/jobs` page with smart filtering

5. **Clickable Recent Jobs Navigation**:
   - Recent job cards on dashboard are now clickable
   - Clicking a job navigates to the corresponding vehicle detail page
   - Hover effects and visual indicators for better UX
   - Direct access to full job history and vehicle information

6. **Revenue Overview Dashboard Card** (Admin Only):
   - New interactive income statistics card showing financial overview
   - **Role-based access control**: Only visible to users with 'admin' role
   - Toggle between three calendar-based periods:
     * **This Week**: Current calendar week (Monday-Sunday)
     * **This Month**: Current calendar month (1st to end of month)
     * **All-Time**: Total revenue since inception
   - Displays actual amounts for each period with visual highlighting
   - Shows current period context (e.g., "December 2025", "This Week (9 Dec)")
   - Real-time calculations based on paid invoices from billing records
   - Color-coded with emerald theme for positive financial metrics
   - Technicians and other non-admin users cannot view revenue data

7. **Live Date & Time Display**:
   - Real-time clock in header showing current date and time
   - Updates every second for accurate timekeeping
   - Format: "Day, DD Mon YYYY HH:MM:SS"
   - Positioned between search bar and profile button
   - Makes the system "self-aware" of current date for better context

8. **UI/UX Improvements**:
   - Removed "New Job" button from main header
   - Removed "Register here" link from login page
   - VIN field no longer has 17-character limit
   - Cleaner, more focused interface
   - Enhanced card interactions with hover states
   - Live clock for real-time date/time awareness

### Code Refactoring:
1. **Backend Restructuring**:
   - Monolithic `server.py` split into modular structure
   - Models moved to `/backend/models/` directory
   - Auth utilities moved to `/backend/utils/` directory
   - Improved maintainability and scalability

2. **Deployment Fixes**:
   - Pinned bcrypt to v3.2.2 for compatibility with passlib
   - Added health check endpoints (`/api/health`, `/api/readiness`)
   - Fixed deployment-related errors

3. **Database Query Optimization**:
   - All queries properly sorted before limiting results
   - Efficient MongoDB operations

## 📈 Future Enhancements

- VIN auto-decoding integration
- WhatsApp API integration (currently copy-to-clipboard)
- Cloud storage for tune files and documents
- Service reminder scheduler
- Retune eligibility alerts
- Advanced analytics and reporting

## 🤝 Development Guidelines

### Adding New Features
1. Create model in `/backend/models/` if needed
2. Add routes to `/backend/server.py`
3. Create frontend page in `/app/frontend/src/pages/`
4. Update routing in `App.js`
5. Test thoroughly with authentication

### Code Style
- Backend: Follow PEP 8, use type hints
- Frontend: Use functional components, hooks
- All async functions should use proper error handling
- Environment variables for all configuration

### Important Notes
- Never modify `bcrypt` version from 3.2.2 (deployment compatibility)
- Always exclude `_id` from MongoDB queries
- Use `datetime.now(timezone.utc)` for timezone-aware timestamps
- Token expiry is set via `ACCESS_TOKEN_EXPIRE_MINUTES` in auth utils

## 🐛 Known Issues & Solutions

### Deployment-Related
All deployment issues from previous versions have been resolved:
- ✅ bcrypt compatibility fixed (v3.2.2)
- ✅ Health check endpoints added
- ✅ All services start correctly

### User-Reported
- Password change functionality implemented and tested on backend
- If users experience login issues after password change, advise clearing browser cache

## 📄 Documentation Files

- `README.md` - This file (main documentation)
- `DEPLOYMENT_FIXES.md` - Details about deployment fixes and health checks

## 📄 License

Proprietary - IgnitionLab Dynamics

---

**Built with ❤️ for automotive tuning professionals**

**Version**: 1.3.0  
**Last Updated**: December 2025
