# AI-Powered Wealth Planning System

## Structure
- **Frontend**: Next.js 14 + Tailwind CSS (in `/frontend`)
- **Backend**: FastAPI + MongoDB (in `/backend`)

## Setup

### Backend
1. Navigate to `/backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Run server: `uvicorn app.main:app --reload`
   - APIs available at `http://localhost:8000/docs`

### Frontend
1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`
   - App available at `http://localhost:3000`

## Features
- **Auth**: Register/Login (JWT)
- **Finance**: Analyze Income/Expense/Savings
- **Stocks**: Historical data & Predictions
- **Recommendations**: AI-driven investment advice
