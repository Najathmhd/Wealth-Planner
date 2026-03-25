import sys
import os
import pkg_resources

# Log to a special debug file
debug_log = open("debug_env.log", "w")
sys.stdout = debug_log
sys.stderr = debug_log

print(f"Python Executable: {sys.executable}")
print(f"Python Version: {sys.version}")
print(f"Working Directory: {os.getcwd()}")
print(f"sys.path: {sys.path}")

print("\nInstalled Packages:")
installed_packages = [f"{d.project_name}=={d.version}" for d in pkg_resources.working_set]
for p in sorted(installed_packages):
    print(f"- {p}")

debug_log.close()
