# Deployment Checklist for Render

## Pre-deployment Setup
- [ ] Code pushed to GitHub repository
- [ ] Render account created
- [ ] Firebase project configured
- [ ] Google AI API key obtained
- [ ] Environment variables documented

## Backend Deployment
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Configure build command: `npm install && npm run build`
- [ ] Configure start command: `npm start`
- [ ] Set environment variables:
  - [ ] NODE_ENV=production
  - [ ] PORT=10000
  - [ ] FIREBASE_PROJECT_ID
  - [ ] FIREBASE_CLIENT_EMAIL
  - [ ] FIREBASE_PRIVATE_KEY
  - [ ] GOOGLE_AI_API_KEY
  - [ ] FRONTEND_URL (update after frontend deployment)
  - [ ] BACKEND_URL (update after backend deployment)
- [ ] Deploy backend service
- [ ] Note backend URL for frontend configuration
- [ ] Test health endpoint: `/health`

## Frontend Deployment
- [ ] Create new Static Site on Render
- [ ] Connect GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Configure build command: `npm install && npm run build:production`
- [ ] Set publish directory: `dist`
- [ ] Set environment variables:
  - [ ] VITE_API_BASE_URL (backend URL + /api)
  - [ ] VITE_FIREBASE_API_KEY
  - [ ] VITE_FIREBASE_AUTH_DOMAIN
  - [ ] VITE_FIREBASE_PROJECT_ID
  - [ ] VITE_FIREBASE_STORAGE_BUCKET
  - [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
  - [ ] VITE_FIREBASE_APP_ID
- [ ] Deploy frontend service
- [ ] Note frontend URL

## Post-deployment Configuration
- [ ] Update backend FRONTEND_URL environment variable with actual frontend URL
- [ ] Update backend BACKEND_URL environment variable with actual backend URL
- [ ] Add frontend domain to Firebase Auth authorized domains
- [ ] Verify built-in keep-alive service is working (check backend logs)
- [ ] Test authentication flow
- [ ] Test resume upload functionality
- [ ] Test AI features
- [ ] Test file downloads
- [ ] Verify all API endpoints working

## Troubleshooting
- [ ] Check build logs if deployment fails
- [ ] Verify all environment variables are set correctly
- [ ] Test CORS configuration
- [ ] Check Firebase security rules
- [ ] Monitor application logs for errors

## Optional: Performance Optimization
- [ ] Set up external monitoring to prevent sleep
- [ ] Configure caching headers
- [ ] Optimize bundle sizes
- [ ] Monitor usage metrics
