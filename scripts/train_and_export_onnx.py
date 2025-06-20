# scripts/train_and_export_onnx.py
import os, pickle, pandas as pd
from sqlalchemy import create_engine
from xgboost import XGBRegressor
from onnxmltools import convert_xgboost
from onnxmltools.utils import save_model
from skl2onnx.common.data_types import FloatTensorType
from dotenv import load_dotenv
load_dotenv()

print("==> Ładuję dane …")
engine = create_engine(
    f"mysql+pymysql://{os.environ['MYSQL_USER']}:{os.environ['MYSQL_PASSWORD']}"
    f"@{os.environ['MYSQL_HOST']}:{os.environ.get('MYSQL_PORT', 3306)}/{os.environ['MYSQL_DATABASE']}"
)
df = pd.read_sql(
    "SELECT area, rooms, price FROM nieruchomosci WHERE price IS NOT NULL", engine
)

X = df[["area", "rooms"]].values        #   2 cechy → f0, f1
y = df["price"].values

print("==> Trenuję …")
model = XGBRegressor(
    objective="reg:squarederror", n_estimators=200, learning_rate=0.05, max_depth=6
).fit(X, y)

os.makedirs("models", exist_ok=True)
pickle.dump(model, open("models/valuation_xgb.pkl", "wb"))

print("==> Konwertuję do ONNX …")
initial_types = [("input", FloatTensorType([None, 2]))]
onnx_model = convert_xgboost(model.get_booster(), initial_types=initial_types, target_opset=15)
save_model(onnx_model, "models/valuation_xgb.onnx")
print("==> DONE  –  models/valuation_xgb.onnx utworzony")