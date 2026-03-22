from fastapi import APIRouter, HTTPException
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

import os
import sys

# Ensure ml directory is in path for relative imports if needed, 
# but since we are restructuring, we'll assume the environment is set up or use absolute imports.
# For now, let's use a standard import assuming the root is in PYTHONPATH
from ml.model import train_and_predict

router = APIRouter()

def get_sentiment(text):
    if not text:
        return "Neutral"
    try:
        from textblob import TextBlob
        analysis = TextBlob(text)
        if analysis.sentiment.polarity > 0.1:
            return "Bullish"
        elif analysis.sentiment.polarity < -0.1:
            return "Bearish"
        else:
            return "Neutral"
    except ImportError:
        print("Warning: TextBlob not installed, defaulting sentiment to Neutral")
        return "Neutral"
    except Exception as e:
        print(f"Warning: TextBlob error {e}, defaulting sentiment to Neutral")
        return "Neutral"

@router.get("/historical/{symbol}")
async def get_historical_data(symbol: str, period: str = "1mo"):
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period=period)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
            
        data = []
        for date, row in hist.iterrows():
            data.append({
                "date": date.strftime("%Y-%m-%d"),
                "price": float(row['Close'])
            })
            
        return {"symbol": symbol, "history": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/predict/{symbol}")
async def predict_stock_price(symbol: str, days: int = 7):
    try:
        # 1. Fetch Data
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="2y")
        
        if len(hist) < 60:
             raise HTTPException(status_code=400, detail=f"Not enough historical data for prediction (need at least 60 days)")

        # 2. Sentiment Analysis
        # yfinance>=0.2.x changed news structure: title is now under n['content']['title']
        headlines = ticker.news or []
        def extract_title(n):
            try:
                return n.get('content', {}).get('title') or n.get('title', '')
            except Exception:
                return ''
        combined_text = " ".join(filter(None, [extract_title(n) for n in headlines[:5]]))
        sentiment = get_sentiment(combined_text)

        # 3. Use ML Model from ml/ folder
        formatted_predictions = train_and_predict(hist, days)

        # 4. Indicators
        hist['SMA_20'] = hist['Close'].rolling(window=20).mean()
        hist['SMA_50'] = hist['Close'].rolling(window=50).mean()

        return {
            "symbol": symbol,
            "current_price": float(hist.iloc[-1]['Close']),
            "market_sentiment": sentiment,
            "indicators": {
                "SMA_20": float(hist['SMA_20'].iloc[-1]) if not pd.isna(hist['SMA_20'].iloc[-1]) else 0,
                "SMA_50": float(hist['SMA_50'].iloc[-1]) if not pd.isna(hist['SMA_50'].iloc[-1]) else 0,
            },
            "prediction": formatted_predictions,
            "model": "LSTM (Long Short-Term Memory)"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
