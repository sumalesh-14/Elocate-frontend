# Vercel Deployment Setup Guide

## Environment Variables

To fix the "Application error: a client side exception has occurred" error in Vercel, you need to set up environment variables:

### 1. In Vercel Dashboard

Go to your project settings → Environment Variables and add:

```
NEXT_PUBLIC_API_URL=https://your-backend-server-url.com
```

**Important:** Replace `https://your-backend-server-url.com` with your actual backend server URL.

### 2. Local Development

Create a `.env.local` file in the `Elocate` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Common Issues Fixed

1. **Removed `next/head` import** - Not compatible with Next.js 14 app directory
2. **Added environment variable for API URL** - Prevents hardcoded localhost in production
3. **Added error handling** - Catches and displays errors gracefully
4. **Added try-catch blocks** - Prevents unhandled promise rejections

## Testing Locally

1. Copy `env.example` to `.env.local`:
   ```bash
   copy env.example .env.local
   ```

2. Update the API URL in `.env.local` if needed

3. Run the development server:
   ```bash
   npm run dev
   ```

## Vercel Deployment Steps

1. Push your changes to GitHub
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Add `NEXT_PUBLIC_API_URL` with your production backend URL
4. Redeploy your application

## Mapbox Token

If you're still seeing errors, your Mapbox token might be invalid. To get a new one:

1. Go to https://account.mapbox.com/
2. Create a new access token
3. Replace the token in `Efacility.tsx` or move it to environment variables:
   - Add `NEXT_PUBLIC_MAPBOX_TOKEN` to Vercel environment variables
   - Update the code to use `process.env.NEXT_PUBLIC_MAPBOX_TOKEN`
