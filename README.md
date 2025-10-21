# 🎒 CampusFind - Lost & Found Management System

A comprehensive web application for managing lost and found items in educational institutions, built with React.js and Supabase.

## 🌟 Features

### 🔐 **Authentication & User Management**
- **Secure Login/Signup** with Supabase Auth
- **Role-based Access** (Students & Faculty)
- **Profile Management** with avatar upload
- **Real-time User Sessions**

### 📱 **Core Functionality**
- **Report Lost Items** - Students can report missing belongings
- **Report Found Items** - Anyone can report found items
- **Status Tracking** - Real-time status updates (Pending, Found, Resolved)
- **Image Upload** - Compressed image uploads (<100KB)
- **Search & Filter** - Find items by category, location, date

### 📊 **Analytics Dashboard**
- **Live Metrics** - Real-time statistics and KPIs
- **Duplicate Detection** - AI-powered similarity detection
- **Smart Categorization** - Automatic item classification
- **Executive Summary** - High-level insights and trends

### 👨‍💼 **Admin Features**
- **Admin Dashboard** - Faculty-only administrative panel
- **Item Management** - Edit, delete, and manage all items
- **User Oversight** - Monitor student activities
- **System Analytics** - Comprehensive reporting

### 🖼️ **Image Management**
- **Client-side Compression** - Automatic image optimization
- **Storage Optimization** - Efficient Supabase storage usage
- **Automatic Cleanup** - Orphaned file removal
- **Avatar Management** - Profile picture handling

## 🛠️ **Technology Stack**

### **Frontend**
- **React.js** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Router** - Client-side routing
- **React Toastify** - Notification system

### **Backend**
- **Supabase** - Backend-as-a-Service
  - PostgreSQL Database
  - Real-time subscriptions
  - Authentication
  - File storage
  - Row Level Security (RLS)

### **Image Processing**
- **browser-image-compression** - Client-side compression
- **Canvas API** - Image manipulation
- **Web Workers** - Background processing

## 📁 **Project Structure**

```
CampusFind/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ImageUploader.jsx # Image compression component
│   │   ├── DuplicateDetection.jsx # AI duplicate detection
│   │   ├── AutoTagging.jsx   # Smart categorization
│   │   └── ExecutiveSummary.jsx # Analytics dashboard
│   ├── utils/               # Utility functions
│   │   ├── avatarManager.js # Avatar management
│   │   └── imageDeletion.js # Image cleanup utilities
│   ├── App.jsx             # Main application component
│   ├── Dashboard.jsx       # Main dashboard container
│   ├── Sidebar.jsx         # Navigation sidebar
│   ├── Lost.jsx           # Lost items form
│   ├── ReportFound.jsx    # Found items form
│   ├── Status.jsx         # Status tracking page
│   ├── Profile.jsx        # User profile management
│   ├── AdminDashBoard.jsx # Admin panel
│   ├── AnalyticsDashboard.jsx # Analytics interface
│   └── supabaseClient.js  # Supabase configuration
├── public/                 # Static assets
├── package.json           # Dependencies
└── README.md             # This file
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Amrutha-Gopalakrishnan/BelongiFy.git
   cd CampusFind
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Create a `.env.local` file in the root directory
   - Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Set up your Supabase database
   - Run the SQL scripts to create tables
   - Configure Row Level Security policies

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:5173`

## 📊 **Database Schema**

### **Tables**
- **`profiles`** - User profile information
- **`lost_items`** - Lost item reports
- **`found_items`** - Found item reports

### **Storage Buckets**
- **`avatars`** - User profile pictures
- **`lost-found-images`** - Item images

## 🔧 **Key Features Explained**

### **Image Compression System**
- **Automatic compression** to under 100KB
- **Quality preservation** with smart algorithms
- **Client-side processing** for fast uploads
- **Fallback handling** for failed compressions

### **Analytics & AI Features**
- **Duplicate Detection**: Uses Jaccard, Levenshtein, and Cosine similarity
- **Smart Categorization**: ML-powered item classification
- **Real-time Metrics**: Live dashboard updates
- **Trend Analysis**: Historical data visualization

### **Security Features**
- **Row Level Security** (RLS) on all tables
- **Role-based access control**
- **Secure file uploads** with validation
- **Input sanitization** and validation

## 🎯 **User Roles**

### **Students**
- Report lost/found items
- Track item status
- Manage profile
- View personal analytics

### **Faculty/Admin**
- All student features
- Admin dashboard access
- Item management
- System analytics
- User oversight

## 📱 **Responsive Design**
- **Mobile-first** approach
- **Responsive navigation** with collapsible sidebar
- **Touch-friendly** interface
- **Cross-platform** compatibility

## 🔄 **Real-time Features**
- **Live updates** for item status changes
- **Real-time notifications**
- **Instant data synchronization**
- **Collaborative features**

## 🚀 **Deployment**

### **Vercel Deployment**
- Configured with `vercel.json`
- Automatic deployments from main branch
- Environment variables setup required

### **Netlify Deployment**
- Configured with `netlify.toml`
- Redirect rules for SPA routing
- Build optimization included

## 📈 **Performance Optimizations**
- **Code splitting** for faster loading
- **Image optimization** and compression
- **Lazy loading** for components
- **Efficient state management**
- **Minimal bundle size**

## 🛡️ **Security Measures**
- **Input validation** on all forms
- **XSS protection** with sanitization
- **CSRF protection** via Supabase
- **Secure authentication** flow
- **File upload security**

## 🔍 **Search & Discovery**
- **Full-text search** across items
- **Category filtering**
- **Date range filtering**
- **Location-based search**
- **Status-based filtering**

## 📊 **Analytics Capabilities**
- **Item statistics** (total, resolved, pending)
- **Recovery rate** calculations
- **User activity** metrics
- **Trend analysis** over time
- **Category distribution** charts

## 🎨 **UI/UX Features**
- **Modern gradient** design
- **Smooth animations** and transitions
- **Intuitive navigation**
- **Accessibility** considerations
- **Dark/light mode** ready

## 🧪 **Testing**
- **Component testing** with React Testing Library
- **Integration testing** for forms
- **E2E testing** capabilities
- **Performance testing** tools

## 📝 **Contributing**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**
This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 **Team**
- **Developer**: Amrutha Gopalakrishnan
- **Project**: Final Year Data Analytics Project

## 🔮 **Future Enhancements**
- **Mobile app** development
- **Push notifications**
- **Advanced AI** features
- **Multi-language** support
- **API documentation**
- **Third-party integrations**

---

**Built with ❤️ for educational institutions to help students find their lost belongings efficiently.**