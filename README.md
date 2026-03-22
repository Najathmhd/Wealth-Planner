# AI-Powered Wealth Planning System

A complete Wealth Planning System with AI-powered stock forecasting, FIRE (Financial Independence, Retire Early) calculation, and personalized financial recommendations.

## 🚀 Project Structure

```text
ai-wealth-planning-system/
│
├── backend/          ← Python, FastAPI logic
│   ├── routes/       ← API Endpoints (Auth, Finance, Stocks, etc.)
│   ├── models/       ← Pydantic/Database Models
│   ├── db/           ← Database Connection logic
│   ├── core/         ← Security & Config
│   └── main.py       ← App entry point
│
├── frontend/         ← Next.js / React UI
│   ├── app/
│   ├── components/
│   └── next.config.mjs
│
├── ml/               ← AI / ML code
│   └── model.py      ← LSTM Stock Prediction Model
│
├── data/             ← Datasets (NO sensitive data)
│   └── sample_data.csv
│
├── docs/             ← Reports, diagrams
│   └── interim_report.md
│
├── README.md
└── .gitignore
```

## 🛠️ Setup Instructions

### Backend
1. Navigate to `backend/`
2. Create virtual environment: `python -m venv .venv`
3. Activate: `.venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `python run_app.py`

### Frontend
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

## 🤖 AI Features
- **Stock Forecasting**: Uses LSTM (Long Short-Term Memory) models to predict future price trends.
- **Sentiment Analysis**: Analyzes market news to provide Bullish/Bearish outlooks.
- **FIRE Roadmap**: Calculates the number of years until financial freedom based on savings and risk appetite.
