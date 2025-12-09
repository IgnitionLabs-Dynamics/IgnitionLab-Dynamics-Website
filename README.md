# IgnitionLab Dynamics - Vehicle Management System

A comprehensive, production-ready web application for managing vehicle servicing, tuning jobs, customer records, and workshop operations.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with role management (Admin, Technician)
- **Customer Management**: Complete customer database with contact details and history
- **Vehicle Tracking**: Detailed vehicle records with QR codes and technical specifications
- **Job Management**: Track all tuning jobs, services, and modifications
- **Tune Revisions**: Version control for tune files and calibration changes
- **Billing & Payments**: Invoice tracking with payment status monitoring
- **Dashboard Analytics**: Real-time stats and insights
- **Filtered Views**: Quick access to jobs this week and pending payments
- **Appointments & Reminders**: Schedule management system

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt password hashing
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
```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

**Check status**:
```bash
sudo supervisorctl status
```

**View logs**:
```bash
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log
```

## 👤 Default Credentials

**Admin Account**:
- **Username**: `IgnitionLab Dynamics`
- **Password**: `IgnLabDyN@2025`

## 📊 Key API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Resources (all require authentication)
- `GET/POST /api/customers` - Customer management
- `GET/POST /api/vehicles` - Vehicle management
- `GET/POST /api/jobs` - Job management
- `GET/POST /api/tune-revisions` - Tune revision tracking
- `GET/POST /api/billing` - Billing records
- `GET/POST /api/appointments` - Appointment scheduling
- `GET/POST /api/reminders` - Reminder management
- `GET /api/dashboard/stats` - Dashboard statistics

### Admin Only
- `GET/POST /api/users` - User management
- `DELETE /api/users/{id}` - Delete user

## 🔐 Security Features

- JWT-based authentication with 24-hour token expiry
- Bcrypt password hashing
- Role-based access control (Admin, Technician)
- Protected API endpoints
- CORS configuration

## 📱 Frontend Pages

- **Dashboard**: Overview with stats and quick access widgets
- **Jobs**: Filtered views (This Week, Pending Payments, All)
- **Customers**: Customer database management
- **Vehicles**: Vehicle database with QR codes
- **Vehicle Detail**: Complete vehicle history, jobs, tune revisions, PDF export
- **Appointments**: Scheduling system
- **Reminders**: Follow-up and service reminder tracking
- **User Management** (Admin): User account management

## 🎨 UI/UX Features

- Dark theme optimized for professional use
- Responsive design (mobile-friendly)
- Interactive dashboard widgets with click-through filtering
- Real-time toast notifications
- QR code generation for vehicle records
- PDF export for complete vehicle history
- Form validation and error handling

## 📝 Code Architecture Highlights

### Backend Best Practices
✅ Modular structure with organized models and utilities  
✅ Async/await pattern for database operations  
✅ Proper error handling with HTTP exceptions  
✅ MongoDB best practices (excluding `_id`, proper indexing)  
✅ Environment variable configuration  
✅ Timezone-aware datetime handling  

### Frontend Best Practices
✅ Component-based architecture  
✅ Custom hooks for API calls  
✅ Context API for global auth state  
✅ Utility functions for formatting (dates, currency)  
✅ Consistent styling with Tailwind  
✅ Accessible UI components (Shadcn)  

## 🔄 Recent Updates (December 2025)

1. **Dashboard Widget Filtering**: 
   - "Jobs This Week" now filters to current calendar week (Monday-Sunday)
   - "Pending Payments" shows jobs with pending/partial payment status
   - New `/jobs` page with smart filtering

2. **Code Optimization**:
   - Backend restructured with organized models and utils
   - Improved separation of concerns
   - Better maintainability and scalability

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

## 📄 License

Proprietary - IgnitionLab Dynamics

---

**Built with ❤️ for automotive tuning professionals**
