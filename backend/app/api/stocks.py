from fastapi import APIRouter, HTTPException, Depends
import yfinance as yf
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from datetime import datetime, timedelta
from textblob import TextBlob
import os
from app.api.auth import get_current_user
from app.models.user import User
from app.db.mongodb import get_database

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
async def predict_stock_price(symbol: str, days: int = 30, current_user: User = Depends(get_current_user)):
    try:
        # 1. Fetch Data
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="2y") # LSTMs need more data
        
        if len(hist) < 60:
             raise HTTPException(status_code=400, detail=f"Not enough historical data for LSTM training (need at least 60 days)")

        # 2. Fetch User Finance context for personalization
        db = await get_database()
        user_id = str(current_user.id) if current_user.id else current_user.email
        finance_data = await db.finance.find_one(
            {"user_id": user_id},
            sort=[("date", -1)]
        )
        surplus = 0
        if finance_data:
            surplus = float(finance_data.get("monthly_income", 0)) - float(finance_data.get("monthly_expenses", 0))

        # 3. Sentiment Analysis
        sentiment = "Neutral"
        try:
            headlines = ticker.news
            if isinstance(headlines, list) and len(headlines) > 0:
                titles = [n.get('title', '') for n in headlines[:5] if isinstance(n, dict)]
                if titles:
                    combined_text = " ".join(titles)
                    sentiment = get_sentiment(combined_text)
        except Exception as e:
            print(f"Failed to fetch or parse news for {symbol}: {e}")

        # 4. Prepare Data for LSTM
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

        # 5. Build & Train LSTM Model 
        model = Sequential()
        model.add(LSTM(50, return_sequences=True, input_shape=(x_train.shape[1], 1)))
        model.add(LSTM(50, return_sequences=False))
        model.add(Dense(25))
        model.add(Dense(1))

        model.compile(optimizer='adam', loss='mean_squared_error')
        model.fit(x_train, y_train, batch_size=32, epochs=1, verbose=0)

        # 6. Predict Future
        last_60_days = scaled_data[-60:]
        x_input = np.reshape(last_60_days, (1, 60, 1))
        
        preds_scaled = []
        curr_input = x_input
        
        for _ in range(30): # Hardcode to 30 for consistency
            pred = model.predict(curr_input, verbose=0)
            preds_scaled.append(pred[0, 0])
            new_input = np.append(curr_input[0, 1:, 0], pred)
            curr_input = np.reshape(new_input, (1, 60, 1))

        predictions = scaler.inverse_transform(np.array(preds_scaled).reshape(-1, 1))

        # 7. Indicators & Formatting
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

        # 8. Recommendation & Personalized Insight
        last_predicted = float(predictions[-1][0])
        current_price = float(hist.iloc[-1]['Close'])
        price_change = ((last_predicted - current_price) / current_price) * 100
        
        # Personalized Platform Logic
        best_platform = "Interactive Brokers (Global)"
        country = getattr(current_user, "country", "United States")
        
        if country == "Sri Lanka":
            if symbol.endswith(".N0000") or ".JKH" in symbol or ".COMB" in symbol:
                best_platform = "Softlogic Invest (CSE)"
            else:
                best_platform = "Vanguard International"
        elif country == "India":
            best_platform = "Zerodha / Groww"
        elif country == "United Kingdom":
            best_platform = "Hargreaves Lansdown / Vanguard UK"
        elif country == "Australia":
            best_platform = "CommSec / Vanguard AU"
        elif country == "Canada":
            best_platform = "Wealthsimple / Questrade"
        elif symbol in ["BTC-USD", "ETH-USD"]:
            best_platform = "Binance / Coinbase"
        else:
            best_platform = "Vanguard / Fidelity"

        # Amount Calculation (15-25% of surplus based on confidence)
        rec_amount = 0
        if price_change > 0 and surplus > 0:
            # If user has a guaranteed safety net (Government Pension), 
            # we can be slightly more aggressive with the liquid surplus.
            employment_type = getattr(current_user, "employment_type", "Private Sector")
            base_multiplier = 0.20 if employment_type == "Government Sector" else 0.15
            
            multiplier = base_multiplier if price_change < 5 else (base_multiplier + 0.10)
            rec_amount = round(surplus * multiplier, 2)

        action = "HOLD"
        if price_change > 2.0 and sentiment == "Bullish":
            action = "BUY"
        elif price_change < -2.0 and (sentiment == "Bearish" or price_change < -5.0):
            action = "SELL"
            
        summary = f"The AI model predicts a {abs(price_change):.1f}% {'climb' if price_change > 0 else 'drop'} over the next 30 days. This suggests a {action} position is optimal."

        return {
            "symbol": symbol,
            "current_price": current_price,
            "market_sentiment": sentiment,
            "recommendation": {
                "action": action,
                "summary": summary,
                "predicted_change_pct": round(price_change, 2),
                "personalized_amount": rec_amount,
                "best_platform": best_platform
            },
            "indicators": {
                "SMA_20": float(hist['SMA_20'].iloc[-1]) if not pd.isna(hist['SMA_20'].iloc[-1]) else 0,
                "SMA_50": float(hist['SMA_50'].iloc[-1]) if not pd.isna(hist['SMA_50'].iloc[-1]) else 0,
            },
            "prediction": formatted_predictions,
            "model": "LSTM (Long Short-Term Memory)"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
