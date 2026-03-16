import sys
import os
import subprocess
import traceback

def run_diagnostic():
    print("=" * 60)
    print("🐍 Python ML Diagnostic Tool")
    print("=" * 60)
    
    # 1. Check Python version
    print(f"Python executable: {sys.executable}")
    print(f"Python version: {sys.version}")
    
    # 2. Check installed packages
    print("\nChecking installed packages...")
    try:
        import flask
        print(f"  [OK] Flask: {flask.__version__}")
    except ImportError:
        print("  [!!] Flask is not installed")

    try:
        import numpy
        print(f"  [OK] NumPy: {numpy.__version__}")
    except ImportError:
        print("  [!!] NumPy is not installed")
    except Exception as e:
        print(f"  [!!] NumPy error: {e}")

    try:
        import pandas
        print(f"  [OK] Pandas: {pandas.__version__}")
    except ImportError:
        print("  [!!] Pandas is not installed")

    try:
        import mediapipe
        print(f"  [OK] MediaPipe is installed")
    except ImportError:
        print("  [!!] MediaPipe is not installed")
    except Exception as e:
        print(f"  [!!] MediaPipe error: {e}")

    # 3. Try to start the API
    print("\nDiagnostic complete.")
    print("=" * 60)

if __name__ == "__main__":
    run_diagnostic()
