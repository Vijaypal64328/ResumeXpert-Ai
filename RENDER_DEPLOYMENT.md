# Render Deployment Guide for ResumeXpert AI

This guide explains how to deploy both the## Step 4: Deploy Keep-Aliv## Step 5: Updat## Step 6: Firebase Configuration

### 6.1 Update Firebase Auth DomainORS Configuration

After both deployments, update the backend's `FRONTEND_URL` environment variable:
1. Go to your backend service in Render dashboard
2. Navigate to "Environment" tab
3. Update `FRONTEND_URL` to your actual frontend URL
4. The backend will automatically redeploy

## Step 6: Firebase Configuration (Recommended for Free Tier)

### 4.1 Create Keep-Alive Web Service
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the keep-alive folder path: `keep-alive`

### 4.2 Configure Keep-Alive Service
- **Name**: `resumexpert-keepalive`
- **Environment**: `Node`
- **Region**: Same as your other services
- **Branch**: `main`
- **Root Directory**: `keep-alive`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4.3 Update URLs in Keep-Alive Script
After deploying frontend and backend, update the URLs in `keep-alive/server.js`:
```javascript
const FRONTEND_URL = 'https://your-actual-frontend-name.onrender.com';
const BACKEND_URL = 'https://your-actual-backend-name.onrender.com';
```

### 4.4 Deploy Keep-Alive Service
This service will ping your frontend and backend every 5 minutes to prevent them from sleeping.

## Step 5: Update CORS Configurationfrontend and backend of ResumeXpert AI on Render's free tier.

## Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to GitHub
2. **Render Account**: Create a free account at [render.com](https://render.com)
3. **Firebase Project**: Set up Firebase for authentication and database
4. **Google AI API Key**: For AI-powered features

## Step 1: Deploy Backend to Render

### 1.1 Create Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the backend folder path: `backend`

### 1.2 Configure Backend Service
- **Name**: `resumexpert-backend` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 1.3 Set Environment Variables
Add these environment variables in Render dashboard:

```bash
NODE_ENV=production
PORT=10000
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key_with_newlines
GOOGLE_AI_API_KEY=your_google_ai_api_key
FRONTEND_URL=https://your-frontend-name.onrender.com
BACKEND_URL=https://your-backend-name.onrender.com
```

**Important**: 
- For `FIREBASE_PRIVATE_KEY`, include the actual newlines from your service account JSON.
- `BACKEND_URL` should be your own backend URL for keep-alive functionality.

### 1.4 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment (usually 5-10 minutes)
3. Note the backend URL: `https://your-backend-name.onrender.com`

## Step 2: Deploy Frontend to Render

### 2.1 Create Static Site
1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Select the frontend folder path: `frontend`

### 2.2 Configure Frontend Service
- **Name**: `resumexpert-frontend` (or your preferred name)
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build:production`
- **Publish Directory**: `dist`

### 2.3 Set Environment Variables
Add these environment variables:

```bash
VITE_API_BASE_URL=https://your-backend-name.onrender.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 2.4 Configure Redirects
Add this to your frontend `render.yaml` (already created):
```yaml
routes:
  - type: rewrite
    source: /*
    destination: /index.html
```

### 2.5 Deploy Frontend
1. Click "Create Static Site"
2. Wait for deployment
3. Your frontend will be available at: `https://your-frontend-name.onrender.com`

## Step 3: Update Environment Variables

After both deployments are complete:

### 3.1 Update Backend Environment Variables
1. Go to your backend service in Render dashboard
2. Navigate to "Environment" tab
3. Update these variables with actual URLs:
   - `FRONTEND_URL` → your actual frontend URL
   - `BACKEND_URL` → your actual backend URL
4. The backend will automatically redeploy and start the keep-alive service

**Built-in Keep-Alive**: The backend now includes keep-alive functionality that will:
- Ping the frontend every 5 minutes
- Ping itself every 5 minutes  
- Only run in production environment
- Log ping results for monitoring

## Step 4: Firebase Configuration

### 4.1 Update Firebase Auth Domain
In Firebase Console:
1. Go to Authentication → Settings → Authorized Domains
2. Add your Render frontend domain: `your-frontend-name.onrender.com`

### 4.2 Update Firestore Security Rules
Ensure your Firestore rules allow authenticated access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 5: Testing

1. **Backend Health Check**: Visit `https://your-backend-name.onrender.com/health`
2. **Frontend**: Visit `https://your-frontend-name.onrender.com`
3. **Authentication**: Test signup/login functionality
4. **File Upload**: Test resume upload and analysis
5. **AI Features**: Test resume generation and AI improvements

## Important Notes

### Free Tier Limitations
- **Sleep Mode**: Services sleep after 15 minutes of inactivity
- **Cold Starts**: First request after sleep takes ~30 seconds
- **Build Time**: 500 build minutes/month limit
- **Bandwidth**: 100GB/month

### Performance Tips
1. **Keep Services Warm**: Use external monitoring services to ping your backend
2. **Optimize Build**: Use npm ci instead of npm install in production
3. **Caching**: Implement proper caching headers
4. **Error Monitoring**: Set up error tracking for production issues

### Security Considerations
1. **Environment Variables**: Never commit sensitive data to Git
2. **CORS**: Keep CORS configuration restrictive
3. **Firebase Rules**: Ensure proper Firestore security rules
4. **API Keys**: Rotate keys periodically

## Troubleshooting

### Common Issues
1. **Build Failures**: Check build logs in Render dashboard
2. **Environment Variables**: Ensure all required variables are set
3. **CORS Errors**: Verify frontend URL in backend CORS configuration
4. **Firebase Errors**: Check Firebase project configuration and API keys

### Logs
- **Backend Logs**: Available in Render dashboard → Your Service → Logs
- **Frontend Build Logs**: Available during deployment
- **Browser Console**: Check for client-side errors

## Continuous Deployment

Render automatically deploys when you push to your configured branch:
1. Push changes to GitHub
2. Render detects changes and starts build
3. New version goes live after successful build

## Support

For deployment issues:
- Check Render documentation
- Review application logs
- Verify environment variables
- Test locally first

## Cost Optimization

To stay within free tier limits:
1. Use efficient build processes
2. Implement proper caching
3. Optimize bundle sizes
4. Monitor usage in Render dashboard
