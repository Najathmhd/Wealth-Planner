from fastapi import APIRouter, HTTPException
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from datetime import datetime, timedelta
from textblob import TextBlob
import os

router = APIRouter()

def get_sentiment(text):
    if not text:
        return "Neutral"
    analysis = TextBlob(text)
    if analysis.sentiment.polarity > 0.1:
        return "Bullish"
    elif analysis.sentiment.polarity < -0.1:
        return "Bearish"
    else:
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
        hist = ticker.history(period="2y") # LSTMs need more data
        
        if len(hist) < 60:
             raise HTTPException(status_code=400, detail=f"Not enough historical data for LSTM training (need at least 60 days)")

        # 2. Sentiment Analysis (Advanced Feature 4)
        headlines = ticker.news
        combined_text = " ".join([n['title'] for n in headlines[:5]])
        sentiment = get_sentiment(combined_text)

        # 3. Prepare Data for LSTM
        data = hist.filter(['Close'])
        dataset = data.values
        scaler = MinMaxScaler(feature_range=(0,1))
        scaled_data = scaler.fit_transform(dataset)

        # Create training set (60 day window)
        train_data = scaled_data
        x_train = []
        y_train = []

        for i in range(60, len(train_data)):
            x_train.append(train_data[i-60:i, 0])
            y_train.append(train_data[i, 0])

        x_train, y_train = np.array(x_train), np.array(y_train)
        x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))

        # 4. Build & Train LSTM Model (Advanced Feature 1)
        model = Sequential()
        model.add(LSTM(50, return_sequences=True, input_shape=(x_train.shape[1], 1)))
        model.add(LSTM(50, return_sequences=False))
        model.add(Dense(25))
        model.add(Dense(1))

        model.compile(optimizer='adam', loss='mean_squared_error')
        model.fit(x_train, y_train, batch_size=32, epochs=1, verbose=0) # Epochs=1 for speed in demo

        # 5. Predict Future
        last_60_days = scaled_data[-60:]
        x_input = np.reshape(last_60_days, (1, 60, 1))
        
        preds_scaled = []
        curr_input = x_input
        
        for _ in range(days):
            pred = model.predict(curr_input, verbose=0)
            preds_scaled.append(pred[0, 0])
            # Update input window
            new_input = np.append(curr_input[0, 1:, 0], pred)
            curr_input = np.reshape(new_input, (1, 60, 1))

        predictions = scaler.inverse_transform(np.array(preds_scaled).reshape(-1, 1))

        # Indicators
        hist['SMA_20'] = hist['Close'].rolling(window=20).mean()
        hist['SMA_50'] = hist['Close'].rolling(window=50).mean()

        last_date = hist.index.max()
        formatted_predictions = []
        for i, price in enumerate(predictions):
            next_date = last_date + timedelta(days=i+1)
            formatted_predictions.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted_price": float(price[0])
            })
            
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
