import uvicorn
import traceback
import sys
import os
from pathlib import Path

# Add parent directory to sys.path for importing app module
sys.path.append(str(Path(__file__).resolve().parent.parent))

def log(msg):
    # Log to the parent directory to keep backend/ root clean but accessible
    log_path = Path(__file__).resolve().parent.parent / "run_app.log"
    with open(log_path, "a") as f:
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


