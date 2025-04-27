# Essentially Sports Reels – Frontend

This is the frontend UI for the Essentially Sports Reels Platform – a mobile-first, Instagram-style vertical video interface for watching AI-generated sports reels.

- Live at https://essentially-sports-reels-theta.vercel.app/
- Create reels from https://essentially-sports-reels-theta.vercel.app/admin

---

# Technical Breakdown - https://docs.google.com/document/d/1I_QO9635VGLPKW3bUQnvFitEt9335vCRgZAS49IAOb4/edit?tab=t.0
# API Documentation - https://docs.google.com/document/d/12czsIA2UAOhWI4BkXUQbMa0Se1jfpJ2T61jD51H2wG8/edit?tab=t.0

## Features

- **Mobile-first vertical UI**
- `/admin` route for generating reels:
  - Enter player name → get real-time suggestions from TheSportsDB
  - Auto-fill sport + thumbnail
  - Upload optional custom images
- `/` root route displays Instagram Reels-style player:
  - Follow, Like, Share, Add buttons
  - Thumbnails and metadata displayed
- **Serverless API Routes** (Next.js):
  - `/api/generate`: Triggers full video generation
  - `/api/reels`: Lists all generated videos with metadata
  - `/api/reels/:id`: Returns signed S3 URL for secure video playback

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run dev server

```bash
npm run dev
App runs at http://localhost:3000
```

## Environment Variables
- Create .env.local:

```bash
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET=
PEXELS_API_KEY=
OPENAI_API_KEY=
```

## Routes Overview
- /admin – Admin panel to generate new reels

- / – Public reel viewer UI

## Tech Stack
```bash
Next.js 15.3.1

TypeScript

Tailwind CSS

Amazon S3 (media storage)

Formidable (file parsing)

FFmpeg (via external microservice)

Polly (text-to-speech)

Gemini / OpenAI (script generation)

Pexels API (image sourcing)
```

## Deployment
- Frontend deployed on Vercel

- FFmpeg service hosted separately (e.g., Render)


