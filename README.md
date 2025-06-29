# GiveawayHub - Dynamic Giveaway Management Platform

A comprehensive full-stack platform for creating, managing, and participating in online giveaways.

## 🚀 Features

### For Participants
- Browse and discover active giveaways
- Multiple entry methods (email, social media, referrals, etc.)
- Real-time countdown timers
- Referral system for bonus entries
- Fair and transparent winner selection

### For Organizers
- Intuitive giveaway creation flow
- Multiple prize configuration
- Entry method customization
- Real-time analytics and reporting
- Winner management system
- CSV export functionality

### Platform Features
- Modern, responsive design
- Role-based authentication
- Real-time updates
- File storage for images
- Email notifications
- Social media integrations

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for data fetching
- **React Hook Form** for form handling
- **Lucide React** for icons

### Backend & Database
- **Supabase** for database, authentication, and storage
- **PostgreSQL** with Row Level Security
- **FastAPI** (Python) for custom backend logic
- **JWT** authentication

### Deployment
- **Render** for hosting both frontend and backend
- **Supabase** for managed database and services

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.10+ (for FastAPI backend)
- Supabase account
- Render account (for deployment)

## 🚀 Quick Start

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Click the "Connect to Supabase" button in the top right of this application
3. This will automatically configure your environment variables

### 2. Database Schema

The following tables will be created in your Supabase project:

- `profiles` - User profiles and roles
- `giveaways` - Giveaway configurations
- `prizes` - Prize information
- `participants` - Giveaway participants
- `entries` - Entry tracking
- `winners` - Winner records
- `audit_logs` - System audit trail

### 3. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_BACKEND_API_URL=http://localhost:8000
```

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── layout/         # Layout components
│   └── giveaway/       # Giveaway-specific components
├── lib/                # Utilities and configurations
├── pages/              # Page components
├── stores/             # Zustand stores
└── types/              # TypeScript type definitions
```

## 🎨 Design System

The application uses a comprehensive design system with:

- **Primary Colors**: Blue palette for main actions
- **Secondary Colors**: Teal palette for secondary elements
- **Accent Colors**: Orange palette for highlights
- **Semantic Colors**: Success, warning, and error states
- **Typography**: Inter font with proper hierarchy
- **Spacing**: 8px grid system
- **Components**: Consistent, reusable UI components

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Secure file uploads to Supabase Storage
- Rate limiting on critical endpoints

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Frontend (Render Static Site)
1. Connect your GitHub repository to Render
2. Set build command: `npm install && npm run build`
3. Set publish directory: `dist`
4. Add environment variables

### Backend (Render Web Service)
1. Connect your backend repository to Render
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables including `SUPABASE_SERVICE_ROLE_KEY`

## 📖 API Documentation

Once the FastAPI backend is deployed, API documentation will be available at:
- Swagger UI: `{backend_url}/docs`
- ReDoc: `{backend_url}/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Open an issue on GitHub
- Contact support at support@giveawayhub.com

---

**Note**: This is the frontend MVP implementation. The complete full-stack solution includes a FastAPI backend for advanced features like winner selection, analytics, and external integrations.