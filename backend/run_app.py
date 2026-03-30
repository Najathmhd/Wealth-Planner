import uvicorn
import traceback
import sys

def log(msg):
    with open("run_app.log", "a") as f:
        f.write(str(msg) + "\n")

log("--- SERVER START ATTEMPT ---")

try:
    log("Importing app.main...")
    from app.main import app
    log("Successfully imported app.main")
    log("Starting uvicorn on http://127.0.0.1:9091")
    # Using a simple print as well to see if it shows up in redirected stdout
    print("Uvicorn starting...") 
    uvicorn.run(app, host="127.0.0.1", port=9091, log_level="info")
    log("Uvicorn finished (this shouldn't happen usually)")

except BaseException as e:
    log(f"CRASH (BaseException): {type(e).__name__}: {str(e)}")
    log(traceback.format_exc())


