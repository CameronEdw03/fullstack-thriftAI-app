import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
from sklearn.ensemble import RandomForestRegressor

# Load dataset
df = pd.read_csv("data/thrift_data_realistic.csv")

# Features and target
X = df[["brand", "category", "condition", "retail_price"]]
y = df["resale_price"]

# Preprocess categorical data
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), ["brand", "category", "condition"]),
        ("num", "passthrough", ["retail_price"])
    ]
)

# Build pipeline
model = Pipeline(steps=[
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
])

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.5, random_state=42)

# Train model
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

print(f"Model R² Score: {r2:.2f}")
print(f"Mean Absolute Error: {mae:.2f}")

# Save trained model
joblib.dump(model, "thrift_model.pkl")
print("✅ Model trained and saved as thrift_model.pkl")

# Show first 10 predictions vs actuals
print("\nSample Predictions (first 10):")
for pred, actual in zip(y_pred[:10], y_test[:10]):
    print(f"Predicted: {pred:.2f}, Actual: {actual}")

