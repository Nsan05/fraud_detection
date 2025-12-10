import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.decomposition import PCA
import json
import os

# Load Data
DATA_PATH = "../Dataset.csv"
if not os.path.exists(DATA_PATH):
    # Fallback for relative path if running from root
    DATA_PATH = "Dataset.csv"

print("Loading dataset...")
try:
    df = pd.read_csv(DATA_PATH)
except FileNotFoundError:
    # Try absolute path just in case
    df = pd.read_csv(r"c:/Users/nithi/Desktop/Courses, Certifications & Internships/KPMG Hackathon/Dataset.csv")

# Rename columns
column_mapping = {
    'Col 1': 'distance_from_home',
    'Col 2': 'distance_from_last_transaction',
    'Col 3': 'ratio_to_median_price',
    'Col 4': 'repeat_retailer',
    'Col 5': 'used_chip',
    'Col 6': 'used_pin_number',
    'Col 7': 'online_order'
}
df.rename(columns=column_mapping, inplace=True)

# 1. EDA Stats
print("Calculating stats...")
stats = df.describe().to_dict()
correlations = df.corr().to_dict()

# 2. Anomaly Detection
print("Training Isolation Forest...")
features = ['distance_from_home', 'distance_from_last_transaction', 'ratio_to_median_price', 
            'repeat_retailer', 'used_chip', 'used_pin_number', 'online_order']

# Scale numerical features (important for distance based metrics, though Trees are robust, scaling helps interpretability later if we use PCA)
scaler = StandardScaler()
df_scaled = df.copy()
df_scaled[['distance_from_home', 'distance_from_last_transaction', 'ratio_to_median_price']] = scaler.fit_transform(df[['distance_from_home', 'distance_from_last_transaction', 'ratio_to_median_price']])

# subsample for faster training if needed, but 1M is doable. Let's do 100k for speed if needed, but FULL is better for accuracy.
# Isolation Forest is efficient.
iso_forest = IsolationForest(n_estimators=100, contamination=0.01, random_state=42, n_jobs=-1)
df['anomaly_score'] = iso_forest.fit_predict(df_scaled[features]) # -1 for outlier, 1 for inlier
df['anomaly_score_raw'] = iso_forest.decision_function(df_scaled[features]) # Lower is more anomalous

# Tag outliers
df['is_anomaly'] = df['anomaly_score'] == -1

# 3. Insights
# Compare mean of anomalies vs normal
anomaly_stats = df.groupby('is_anomaly')[features].mean().to_dict()

# Calculate statistics for normal transactions to determine deviations
normal_df = df[~df['is_anomaly']]
normal_means = normal_df[features].mean()
normal_stds = normal_df[features].std()

def get_risk_factors(row):
    factors = []
    # Check numerical features for large deviations (> 3 std from normal mean)
    for feature in ['distance_from_home', 'distance_from_last_transaction', 'ratio_to_median_price']:
        z_score = (row[feature] - normal_means[feature]) / normal_stds[feature]
        if z_score > 3:
            factors.append(f"{feature.replace('_', ' ').title()} ({z_score:.1f}x normal dev)")
            
    # Check categorical rules (heuristic)
    if row['online_order'] == 1 and row['used_pin_number'] == 0:
         # Just an example rule, but let's stick to deviations for data-driven insights
         pass
         
    if not factors:
        factors.append("Pattern anomaly (Multi-feature)")
        
    return "; ".join(factors)

# 4. Prepare Data for Dashboard (Sampling)
print("Preparing output...")

# Sort by anomaly score (ascending = most anomalous first)
df_sorted = df.sort_values('anomaly_score_raw', ascending=True)

# Take top anomalies (500)
anomalies = df_sorted[df_sorted['is_anomaly']].head(500).copy()
# Calculate risk factors for these top anomalies
anomalies['risk_factors'] = anomalies.apply(get_risk_factors, axis=1)

normals = df[~df['is_anomaly']].sample(n=500, random_state=42).copy()
normals['risk_factors'] = "Normal"

viz_df = pd.concat([anomalies, normals])

# Add PCA coordinates for 2D visualization
pca = PCA(n_components=2)
coords = pca.fit_transform(viz_df[['distance_from_home', 'distance_from_last_transaction', 'ratio_to_median_price']])
viz_df['pca_x'] = coords[:, 0]
viz_df['pca_y'] = coords[:, 1]

# Top Risk Transactions for Table
top_risks = anomalies.head(50).to_dict(orient='records')

output_data = {
    "stats": stats,
    "correlations": correlations,
    "anomaly_comparison": anomaly_stats,
    "total_records": len(df),
    "total_anomalies": int(df['is_anomaly'].sum()),
    "samples": viz_df.to_dict(orient='records'),
    "top_risks": top_risks
}

with open("analysis_results.json", "w") as f:
    json.dump(output_data, f)

print("Analysis complete. Saved to analysis_results.json")
