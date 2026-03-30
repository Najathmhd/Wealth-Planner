import asyncio
import sys
from traceback import print_exc
import pandas as pd
import yfinance as yf
sys.path.append('.')

async def test():
    try:
        from app.api.stocks import predict_stock_price
        print("Testing predict_stock_price")
        res = await predict_stock_price("AAPL", 30)
        print("Success!")
    except Exception as e:
        print_exc()

if __name__ == "__main__":
    asyncio.run(test())
