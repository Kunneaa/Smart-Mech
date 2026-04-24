import sys
import json
import warnings
from pathlib import Path
import pandas as pd
import numpy as np
from joblib import load

warnings.filterwarnings("ignore", category=UserWarning)

PROJECT_ROOT = Path(__file__).resolve().parents[1]
MONITOR_JSON_PATH = PROJECT_ROOT / "database" / "monitor.json"
ARTIFACT_DIR = PROJECT_ROOT / "ml" / "models"
MODEL_PATH = ARTIFACT_DIR / "motor_retrieval_model.joblib"
SCALER_PATH = ARTIFACT_DIR / "motor_scaler.joblib"
FEATURES = ['cong_suat', 'van_toc_vong_quay', 'he_so_cong_suat']

def predict(cong_suat, van_toc, he_so):
    # Tải mô hình và scaler đã train
    model = load(MODEL_PATH)
    scaler = load(SCALER_PATH)
    
    # Load dataset để lấy ID (Lưu ý: lấy theo đúng thứ tự lúc train)
    df_goc = pd.read_json(MONITOR_JSON_PATH).dropna(subset=FEATURES)
    
    user_input = np.array([[cong_suat, van_toc, he_so]])
    input_scaled = scaler.transform(user_input)
    
    # Tìm 3 động cơ gần nhất
    distances, indices = model.kneighbors(input_scaled)
    
    recommended_motors = df_goc.iloc[indices[0]]
    
    return {"ids": [int(x) for x in recommended_motors['id'].tolist()]}

if __name__ == "__main__":
    try:
        cong_suat = float(sys.argv[1])
        van_toc = float(sys.argv[2])
        he_so = float(sys.argv[3])
        
        # Dự đoán
        result = predict(cong_suat, van_toc, he_so)
        
        # Trả về JSON chuẩn cho Node.js
        print(json.dumps({"ids": list(result["ids"])}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
