import json
import warnings
from pathlib import Path

import pandas as pd
import numpy as np
from joblib import dump, load
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore", category=UserWarning)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MONITOR_JSON_PATH = PROJECT_ROOT / "database" / "monitor.json"
ARTIFACT_DIR = PROJECT_ROOT / "ml" / "models"
MODEL_PATH = ARTIFACT_DIR / "motor_retrieval_model.joblib"
SCALER_PATH = ARTIFACT_DIR / "motor_scaler.joblib"
FEATURES = ['cong_suat', 'van_toc_vong_quay', 'he_so_cong_suat']

def build_recommendation_system():
    df = pd.read_json(MONITOR_JSON_PATH)
    
    df = df.dropna(subset=FEATURES)
    X = df[FEATURES].values
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = NearestNeighbors(n_neighbors=3, algorithm='auto')
    model.fit(X_scaled)
    
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    dump(model, MODEL_PATH)
    dump(scaler, SCALER_PATH)
    
    print("Đã xây dựng xong CSDL gợi ý không gian 3 chiều và lưu Artifacts!")

def recommend_motors_for_backend(cong_suat, van_toc, he_so):
    model = load(MODEL_PATH)
    scaler = load(SCALER_PATH)
    
    df_goc = pd.read_json(MONITOR_JSON_PATH).dropna(subset=FEATURES)
    
    user_input = np.array([[cong_suat, van_toc, he_so]])
    input_scaled = scaler.transform(user_input)
    
    distances, indices = model.kneighbors(input_scaled)
    
    recommended_motors = df_goc.iloc[indices[0]]
    
    result = recommended_motors.to_dict(orient='records')
    return result

if __name__ == "__main__":
    build_recommendation_system()
    
    sinh_vien_input = [2.0, 1450, 0.85]
    ket_qua_json_dict = recommend_motors_for_backend(*sinh_vien_input)
    
    print("\n=== TOP 3 ĐỘNG CƠ PHÙ HỢP NHẤT DÀNH CHO JSON BACKEND ===")
    print(json.dumps(ket_qua_json_dict, indent=2, ensure_ascii=False))