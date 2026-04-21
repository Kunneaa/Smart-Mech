from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report


def build_synthetic_dataset(n_samples: int = 3000, seed: int = 42):
	rng = np.random.default_rng(seed)

	force = rng.uniform(100, 500, n_samples)
	speed = rng.uniform(0.5, 2.5, n_samples)
	drum = rng.uniform(200, 500, n_samples)
	load_k = rng.uniform(1.0, 3.0, n_samples)

	p_lv = force * speed
	p_ct_kw = (p_lv * load_k) / (0.9 * 1000)

	labels = np.where(
		p_ct_kw <= 1.1,
		"MTR-001",
		np.where(p_ct_kw <= 1.5, "MTR-002", np.where(p_ct_kw <= 2.2, "MTR-003", "MTR-005")),
	)

	x = np.column_stack([force, speed, drum, load_k, p_ct_kw])
	return x, labels


def train_model():
	x, y = build_synthetic_dataset()
	x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

	model = RandomForestClassifier(n_estimators=200, random_state=42)
	model.fit(x_train, y_train)

	y_pred = model.predict(x_test)
	print(classification_report(y_test, y_pred))

	return model


def save_artifacts(model):
	output_dir = Path(__file__).resolve().parents[1] / "models"
	output_dir.mkdir(parents=True, exist_ok=True)

	# Keep artifact JSON to avoid extra runtime dependencies (pickle/joblib policy can be added later).
	summary = {
		"model_type": "RandomForestClassifier",
		"n_estimators": 200,
		"feature_order": ["force", "speed", "drum_diameter", "load_coefficient", "required_power_kw"],
	}
	(output_dir / "motor_recommendation_model_meta.json").write_text(
		json.dumps(summary, indent=2),
		encoding="utf-8",
	)


if __name__ == "__main__":
	trained_model = train_model()
	save_artifacts(trained_model)
	print("Training pipeline finished.")

