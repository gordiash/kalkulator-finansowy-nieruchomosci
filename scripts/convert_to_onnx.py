# scripts/convert_to_onnx.py
import pickle, numpy as np, os
import xgboost as xgb                        # wbudowany konwerter ONNX

PICKLE_PATH = "models/valuation_xgb.pkl"
ONNX_PATH   = "models/valuation_xgb.onnx"

model = pickle.load(open(PICKLE_PATH, "rb"))

# przykładowy pusty tensor (kształt 1 × n_cech) – potrzebny do wnioskowania wejścia
dummy_input = np.zeros((1, model.n_features_in_), dtype=np.float32)

print("Konwertuję przez xgboost.onnx …")
onnx_model = xgb.onnx.to_onnx(model, dummy_input, target_opset=15)

os.makedirs("models", exist_ok=True)
with open(ONNX_PATH, "wb") as f:
    f.write(onnx_model.SerializeToString())
print("Plik ONNX zapisany:", ONNX_PATH)

print("Konwersja zakończona pomyślnie ✅")