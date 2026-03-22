print("Main.py loading...")
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AI-Powered Wealth Planner API", version="1.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI-Powered Wealth Planner API"}

from routes import auth, finance, stocks, recommendations, chat

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(finance.router, prefix="/api/finance", tags=["finance"])
app.include_router(stocks.router, prefix="/api/stocks", tags=["stocks"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

