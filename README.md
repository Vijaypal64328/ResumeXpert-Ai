# ResumeXpert Pro - AI-Powered Career Advancement Platform

[![GitHub](https://img.shields.io/badge/GitHub-ResumeXpert-blue.svg)](https://github.com/Vijaypal64328/ResumeXpert-Ai)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)

An intelligent resume builder and career optimization platform powered by AI, designed to help job seekers create compelling resumes, analyze job compatibility, and enhance their career prospects.

## 🚀 Features

### 📄 AI-Powered Resume Builder
- **Smart Resume Generation**: Create professional resumes with AI assistance
- **ATS Optimization**: Ensure your resume passes Applicant Tracking Systems
- **Multiple Templates**: Choose from professional, modern, and creative designs
- **Real-time Preview**: See changes instantly as you build

### 🎯 Job Matching & Analysis
- **Resume-Job Compatibility**: Analyze how well your resume matches specific job postings
- **Skills Gap Analysis**: Identify missing skills and get improvement suggestions
- **Role Match Scoring**: Get percentage-based compatibility scores
- **Industry Insights**: Understand what employers in your field are looking for

### 📊 Career Analytics
- **Performance Dashboard**: Track your resume effectiveness and job application success
- **Resume Scoring**: Get detailed feedback on resume quality and completeness
- **Trend Analysis**: Monitor improvements over time
- **Actionable Insights**: Receive personalized recommendations for career growth

### 💼 Professional Tools
- **Cover Letter Generator**: Create tailored cover letters for specific job applications
- **Job Search Integration**: Find relevant job opportunities from multiple sources
- **Document Management**: Organize and manage multiple resume versions
- **Export Options**: Download resumes in PDF and other formats

## 📸 Screenshots

### 🏠 Landing Page
![Landing Page](./screenshots/landingpage.png)
*Modern and clean landing page with hero section and feature highlights*

### 🔐 Authentication
![Login Page](./screenshots/loginpage.png)
*Secure login interface with Firebase authentication*

### 📊 Dashboard Overview
![Dashboard](./screenshots/dashboardpage.png)
*Comprehensive dashboard with resume statistics and quick actions*

### 🎯 Features Overview
![Features Page](./screenshots/featurespage.png)
*Detailed feature showcase highlighting AI-powered capabilities*

### 🔍 Resume Analysis
![Resume Analysis](./screenshots/resumeanalysispage.jpeg)
*AI-powered resume analysis with detailed feedback and suggestions*

### 🛠️ Resume Builder
![Resume Builder](./screenshots/resumebuilder.png)
*Interactive resume builder with real-time preview and AI assistance*

### 📄 My Resumes
![All Resume Page](./screenshots/allresumepage.png)
*Manage all your resumes in one place with easy access to edit and download*

### ✉️ Cover Letter Generator
![Cover Letter Generator](./screenshots/coverletterpage.jpeg)
*AI-powered cover letter generation tailored to specific job applications*

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Lucide React** for icons
- **Firebase Authentication** for user management
- **Axios** for API communication
- **Sonner** for toast notifications

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Firebase Admin SDK** for authentication and Firestore
- **Google Generative AI** for resume analysis and content generation
- **pdf-parse** and **mammoth** for document processing
- **Multer** for file uploads

### Infrastructure
- **Firebase Firestore** for database
- **Firebase Storage** for file storage
- **Firebase Authentication** for user management
- **Google Gemini AI** for intelligent content generation

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Firebase project with Firestore and Authentication enabled
- Google AI API key for Gemini

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vijaypal64328/ResumeXpert-Ai.git
   cd ResumeXpert-Ai
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   Create environment files from examples:
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   
   # Frontend environment (if needed)
   cd ../frontend
   cp .env.example .env
   ```

   **Configure Firebase Service Account:**
   
   You have two options for Firebase authentication:

   **Option A: Using Service Account JSON File (Development)**
   1. Go to [Firebase Console](https://console.firebase.google.com/)
   2. Select your project → Project Settings → Service Accounts
   3. Click "Generate new private key" → Download the JSON file
   4. **IMPORTANT**: Do NOT place this file inside your project directory
   5. Create a `secrets` folder outside your project:
      ```bash
      # Create secrets folder outside project
      mkdir ../secrets
      # Move the downloaded file there
      move path/to/downloaded-service-account.json ../secrets/serviceAccountKey.json
      ```
   6. Set the path in your `backend/.env`:
      ```env
      GOOGLE_APPLICATION_CREDENTIALS=../secrets/serviceAccountKey.json
      ```

   **Option B: Using Environment Variables (Production Recommended)**
   1. Extract values from the service account JSON file
   2. Set individual environment variables in `backend/.env`:
      ```env
      FIREBASE_PROJECT_ID=your-project-id
      FIREBASE_CLIENT_EMAIL=your-service-account-email@project.iam.gserviceaccount.com
      FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-private-key-here\n-----END PRIVATE KEY-----"
      ```

   **Complete your environment variables in `backend/.env`:**
   ```env
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY=your-private-key
   
   # Google AI API
   GOOGLE_API_KEY=your-gemini-api-key
   
   # API Configuration
   VITE_API_BASE_URL=http://localhost:4000
   
   # Frontend Firebase Config
   VITE_FIREBASE_API_KEY=your-firebase-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_APP_ID=your-firebase-app-id
   
   # Optional: Third-party APIs
   ADZUNA_APP_ID=your-adzuna-app-id
   ADZUNA_APP_KEY=your-adzuna-app-key
   
   # Optional: Log level
   LOG_LEVEL=info
   ```

4. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database and Authentication
   - Generate a service account key (see `backend/README-secrets.md` for security guidelines)

## 🔐 Security Guidelines

**⚠️ IMPORTANT: Never commit sensitive files to your repository!**

### Service Account Security:
1. **Never place `serviceAccountKey.json` inside your project directory**
2. **Never commit `.env` files containing secrets**
3. **Use environment variables in production** (Azure Key Vault, AWS Secrets Manager, etc.)
4. **Rotate keys immediately** if accidentally exposed

### For Production Deployment:
- Use your cloud provider's secret management service
- Set environment variables through your hosting platform
- Never store secrets in plain text files

### If You Accidentally Commit Secrets:
1. **Immediately rotate the compromised keys** in Firebase Console
2. Use the provided script: `scripts/remove-secret-history.sh`
3. Force push the cleaned repository
4. Notify all collaborators to re-clone the repository

For detailed security instructions, see: `backend/README-secrets.md`

5. **Start the application**
   ```bash
   # Start backend server (from backend directory)
   npm run dev

   # Start frontend development server (from frontend directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## 📁 Project Structure

```
ResumeXpert/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Authentication & validation
│   │   ├── routes/          # API routes
│   │   ├── config/          # Firebase & app configuration
│   │   ├── models/          # Data models
│   │   ├── utils/           # Utility functions & logger
│   │   └── tests/           # Unit tests
│   ├── .env.example         # Environment template
│   └── package.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── context/         # React context providers
│   │   ├── lib/             # Utilities & API client
│   │   └── hooks/           # Custom React hooks
│   └── package.json
├── screenshots/             # UI screenshots for documentation
├── scripts/                 # Utility scripts
└── README.md
```

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm test             # Run tests
```

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality
- **TypeScript** for type safety across both frontend and backend
- **ESLint** for code linting and formatting
- **Centralized Logging** with environment-aware verbosity
- **Error Handling** with proper HTTP status codes and user-friendly messages

## 🔐 Security Features

- **Firebase Authentication** with email/password and Google OAuth
- **Protected Routes** with authentication middleware
- **Input Validation** and sanitization
- **Secure File Uploads** with type and size validation
- **Environment-based Configuration** for sensitive data
- **Service Account Security** with proper secret management

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting provider
```

### Backend Deployment (Railway/Heroku/DigitalOcean)
```bash
cd backend
npm run build
# Set environment variables on your hosting platform
# Deploy the built application
```

### Environment Variables for Production
- Use your cloud provider's secret management service
- Never commit sensitive keys to version control
- Rotate service account keys regularly
- Monitor for unusual API usage

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powering intelligent resume analysis
- **Firebase** for providing robust backend infrastructure
- **Tailwind CSS** for beautiful, responsive design system
- **React Community** for excellent tooling and ecosystem

## 📞 Support

- Create an [Issue](https://github.com/Vijaypal64328/ResumeXpert-Ai/issues) for bug reports or feature requests
- Join our [Discussions](https://github.com/Vijaypal64328/ResumeXpert-Ai/discussions) for community support
- Follow [@Vijaypal64328](https://github.com/Vijaypal64328) for updates

---

**Made with ❤️ by [Vijaypal64328](https://github.com/Vijaypal64328)**

*Empowering careers through intelligent technology*
