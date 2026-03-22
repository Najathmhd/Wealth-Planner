import numpy as np
from datetime import timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global flags for library availability
ML_AVAILABLE = False
try:
    from sklearn.preprocessing import MinMaxScaler
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import LSTM, Dense
    ML_AVAILABLE = True
except ImportError as e:
    logger.warning(f"ML libraries not found or failed to import: {e}. Predictions will be mocked.")
except Exception as e:
    logger.warning(f"Unexpected error importing ML libraries: {e}. Predictions will be mocked.")

def train_and_predict(hist_data, days=7):
    """
    Trains an LSTM model on historical stock data and predicts future prices.
    If ML libraries are missing, returns a simple linear projection.
    """
    if not ML_AVAILABLE:
        # Fallback Logic: Simple Linear Trend
        logger.info("Using fallback (linear trend) prediction due to missing ML libraries.")
        return predict_fallback(hist_data, days)

    try:
        # 1. Prepare Data
        data = hist_data.filter(['Close'])
        dataset = data.values
        scaler = MinMaxScaler(feature_range=(0,1))
        scaled_data = scaler.fit_transform(dataset)

        # Create training set (60 day window)
        # Ensure we have enough data
        if len(scaled_data) <= 60:
             logger.warning("Not enough data for 60-day window. Using fallback.")
             return predict_fallback(hist_data, days)

        x_train = []
        y_train = []

        for i in range(60, len(scaled_data)):
            x_train.append(scaled_data[i-60:i, 0])
            y_train.append(scaled_data[i, 0])

        x_train, y_train = np.array(x_train), np.array(y_train)
        x_train = np.reshape(x_train, (x_train.shape[0], x_train.shape[1], 1))

        # 2. Build & Train LSTM Model
        model = Sequential()
        model.add(LSTM(50, return_sequences=True, input_shape=(x_train.shape[1], 1)))
        model.add(LSTM(50, return_sequences=False))
        model.add(Dense(25))
        model.add(Dense(1))

        model.compile(optimizer='adam', loss='mean_squared_error')
        model.fit(x_train, y_train, batch_size=32, epochs=5, verbose=0) 

        # 3. Predict Future
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

        # 4. Format Output
        last_date = hist_data.index.max()
        formatted_predictions = []
        for i, price in enumerate(predictions):
            next_date = last_date + timedelta(days=i+1)
            formatted_predictions.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "predicted_price": round(float(price[0]), 2)
            })
            
        return formatted_predictions

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return predict_fallback(hist_data, days)

def predict_fallback(hist_data, days):
    """Simple linear projection based on last few days average change"""
    last_price = float(hist_data['Close'].iloc[-1])
    
    # Calculate average daily change over last 10 days
    last_10 = hist_data['Close'].tail(10)
    avg_change = (last_10.iloc[-1] - last_10.iloc[0]) / len(last_10)
    
    formatted_predictions = []
    last_date = hist_data.index.max()
    
    current_simulated_price = last_price
    
    for i in range(days):
        current_simulated_price += avg_change
        next_date = last_date + timedelta(days=i+1)
        formatted_predictions.append({
            "date": next_date.strftime("%Y-%m-%d"),
            "predicted_price": round(current_simulated_price, 2)
        })
        
    return formatted_predictions
