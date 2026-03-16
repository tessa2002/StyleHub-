
import traceback
import sys

print(f"Python version: {sys.version}")

try:
    import numpy
    print(f"Numpy version: {numpy.__version__}")
except Exception as e:
    print("Numpy failed to import")
    traceback.print_exc()

try:
    import joblib
    print("Joblib ok")
except Exception as e:
    print("Joblib failed to import")
    traceback.print_exc()

try:
    import sklearn
    print(f"Sklearn version: {sklearn.__version__}")
except Exception as e:
    print("Sklearn failed to import")
    traceback.print_exc()

try:
    import pandas
    print(f"Pandas version: {pandas.__version__}")
except Exception as e:
    print("Pandas failed to import")
    traceback.print_exc()
