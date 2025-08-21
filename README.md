# ResumeXpert AI 🚀

An intelligent resume builder powered by Google's Gemini AI that helps you create, analyze, and optimize professional resumes with AI-driven insights.

## ✨ Features

### 🤖 AI-Powered Tools
- **Resume Analysis** - Get detailed feedback on your resume with scoring and suggestions
- **Cover Letter Generation** - Create personalized cover letters tailored to job descriptions
- **Grammar & Content Enhancement** - AI-powered grammar correction and content improvement
- **Job Matching** - Smart job recommendations based on your resume

### 📋 Resume Builder
- **Interactive Builder** - Step-by-step resume creation with real-time preview
- **Multiple Templates** - Professional resume templates for different industries
- **PDF Export** - Download your resume as a professional PDF
- **Auto-Save** - Never lose your progress with automatic saving

### 🎯 Smart Features
- **Multi-Model AI System** - 150 AI requests/day using 3 different Gemini models
- **Cost Optimization** - Intelligent model selection based on task complexity
- **Usage Monitoring** - Track your AI usage and get upgrade recommendations
- **Real-time Collaboration** - Share and collaborate on resumes

## 🌐 Live Demo

- **Frontend**: [https://resumexpert-ai.onrender.com](https://resumexpert-ai.onrender.com)
- **Backend API**: [https://resumexpert-ai-backend.onrender.com](https://resumexpert-ai-backend.onrender.com)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Hook Form** for form management
- **Firebase Auth** for authentication

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Google Generative AI** (Gemini) for AI features
- **Firebase Admin SDK** for authentication & database
- **Firestore** for data storage
- **Axios** for HTTP requests

### AI & Services
- **Google Gemini 1.5 Flash** - Primary AI model
- **Google Gemini 1.0 Pro** - Fallback model
- **Google Gemini 1.5 Pro** - High-complexity tasks
- **Adzuna API** - Job search integration
- **PDF Generation** - Resume export functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore and Authentication
- Google AI API key (Gemini)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Vijaypal64328/ResumeXpert-Ai.git
cd ResumeXpert-Ai
```

2. **Backend Setup**
```bash
cd backend
npm install
```

3. **Configure Environment Variables**
Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# AI Configuration
GOOGLE_AI_API_KEY=your_gemini_api_key_here
AI_TIER=free
ENABLE_MULTI_MODEL=true

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_service_account
# OR
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json

# Job API (Optional)
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
```

4. **Frontend Setup**
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

5. **Start Development Servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

## 📊 AI Usage & Quotas

### Free Tier (Current)
- **150 requests/day** across 3 Gemini models
- **Automatic fallback** when quotas are reached
- **Smart model selection** based on task complexity

### Usage Monitoring
Check your AI usage at: `GET /api/usage/stats`

```json
{
  "dailyRequests": 45,
  "estimatedQuotaUsage": "30% of 150 daily requests",
  "recommendation": "NORMAL: Current free tier sufficient"
}
```

## 📡 API Endpoints

### Core Features
- `POST /api/resumes/analyze/:id` - Analyze resume
- `POST /api/cover-letter/generate` - Generate cover letter
- `POST /api/builder/generate` - Generate resume content
- `POST /api/match/compare` - Job matching

### AI Enhancements
- `POST /api/ai/fix-field` - Grammar correction
- `POST /api/ai/fix-summary` - Summary enhancement
- `POST /api/ai/fix-experience` - Experience optimization

### Monitoring
- `GET /api/usage/stats` - Usage statistics
- `GET /api/health` - Health check

## 🚀 Deployment

### Render Deployment

Both frontend and backend are configured for Render deployment:

1. **Backend**: Automatically deploys to `resumexpert-ai-backend.onrender.com`
2. **Frontend**: Automatically deploys to `resumexpert-ai.onrender.com`

#### Environment Variables for Render:
- `GOOGLE_AI_API_KEY` - Your Gemini API key
- `FIREBASE_SERVICE_ACCOUNT_BASE64` - Base64 encoded Firebase service account
- `NODE_ENV=production`
- `AI_TIER=free`

### Keep-Alive System
The backend includes automatic keep-alive functionality to prevent Render free tier sleeping:
- Self-pings every 14 minutes
- Maintains uptime without manual intervention

## 🔒 Security Features

- **Firebase Authentication** - Secure user management
- **API Key Protection** - Environment variable configuration
- **CORS Configuration** - Secure cross-origin requests
- **Input Validation** - Comprehensive request validation
- **Rate Limiting** - AI usage monitoring and limits

## 📈 Performance

- **Multi-Model AI** - Optimized for different task complexities
- **Caching** - Efficient data retrieval
- **Lazy Loading** - Optimized frontend performance
- **CDN Ready** - Static asset optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vijaypal Singh**
- GitHub: [@Vijaypal64328](https://github.com/Vijaypal64328)

## 🙏 Acknowledgments

- Google Generative AI for powerful AI capabilities
- Firebase for authentication and database services
- Render for reliable hosting
- The open-source community for amazing tools and libraries

---

**Built with ❤️ using React, Node.js, and Google AI**