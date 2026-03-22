import uvicorn
import traceback
import sys
import os

# Force output to flush immediately for terminal visibility
if sys.version_info >= (3, 7):
    sys.stdout.reconfigure(line_buffering=True)
    sys.stderr.reconfigure(line_buffering=True)

def log(msg):
    print(f"[DEBUG] {msg}", flush=True)
    with open("run_app.log", "a") as f:
        f.write(str(msg) + "\n")

log("--- SERVER START ATTEMPT ---")

# Add current directory and project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)

if current_dir not in sys.path:
    sys.path.append(current_dir)
if root_dir not in sys.path:
    sys.path.append(root_dir)

log(f"Backend Dir: {current_dir}")
log(f"Project Root: {root_dir}")

try:
    log("Importing main.app...")
    from main import app
    log("Successfully imported main.app")
    log("Starting uvicorn on http://127.0.0.1:9091")
    uvicorn.run(app, host="127.0.0.1", port=9091, log_level="info")

except BaseException as e:
    log(f"CRASH: {type(e).__name__}: {str(e)}")
    traceback.print_exc()
    log(traceback.format_exc())


