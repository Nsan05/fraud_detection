# Fraud Detection Dashboard (AI-Powered)

## Overview

This project implements an advanced analytical dashboard for detecting and visualizing potential fraudulent transactions. Utilizing an Isolation Forest algorithm, the system identifies anomalous activities based on behavioral deviations from established patterns. The solution provides transparent, explainable insights into risk factors such as unusual geographical locations, high transaction amounts relative to median prices, and irregular spending behaviors.

The architecture comprises a Python-based backend for data processing and machine learning, coupled with a React frontend for interactive data visualization.

## Features

- **Unsupervised Anomaly Detection**: Implementation of the Isolation Forest algorithm to identify outliers without labeled training data.
- **Risk Factor Analysis**: Automated calculation of key risk drivers for each flagged transaction (e.g., significant deviation in distance from home).
- **Interactive Visualization**:
  - **KPI Metrics**: Real-time overview of total transactions, detected anomalies, and fraud rates.
  - **Fraud Drivers Analysis**: Aggregated visualization of the primary factors contributing to fraud classifications.
  - **Distribution Analysis**: Scatter plot visualization distinguishing between normal and anomalous transaction clusters.
  - **Risk Prioritization**: Detailed table highlighting high-risk transactions sorted by anomaly score for immediate review.

## Technology Stack

- **Backend**: Python, Pandas, Scikit-learn, NumPy
- **Frontend**: React, Vite, Recharts
- **Data Processing**: JSON-based data exchange

## Prerequisites

Ensure the following are installed on your system:

- Python 3.8 or higher
- Node.js 16 or higher
- npm (Node Package Manager)

## Setup and Installation

### 1. Backend Analysis

Navigate to the project directory and execute the analysis script to generate the fraud detection model.

```bash
cd fraud_dashboard
pip install -r requirements.txt
python analyze.py
```

This process generates an `analysis_results.json` file containing the model's output.

### 2. Frontend Dashboard

Initialize and start the visualization interface.

```bash
cd dashboard_app
npm install
npm run dev
```

If you encounter path-related issues with the standard startup command, you may alternatively run:

```bash
node node_modules/vite/bin/vite.js
```

### 3. Application Access

Once the server is running, the dashboard can be accessed via a web browser at:
`http://localhost:5173/`

## Dataset Features

The project utilizes a transaction dataset containing the following behavioral and transactional features used for anomaly detection:

| Feature                            | Description                                                                                                                                 |
| :--------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Distance from Home**             | The distance from the calculated home location where the transaction occurred. Significant deviations often indicate fraud.                 |
| **Distance from Last Transaction** | Ideally, the distance between the current and previous transaction. Large jumps in short times suggest impossible travel (velocity checks). |
| **Ratio to Median Price**          | The transaction amount divided by the median price for that user/category. High ratios (>3x) are strong indicators of anomaly.              |
| **Repeat Retailer**                | Boolean (1/0) indicating if the transaction was at a known retailer. New retailers may carry slightly higher risk.                          |
| **Used Chip**                      | Boolean (1/0) indicating if the transaction used a chip (EMV). Secure.                                                                      |
| **Used PIN Number**                | Boolean (1/0) indicating if a PIN was entered. Highly secure.                                                                               |
| **Online Order**                   | Boolean (1/0) indicating if the transaction was online (CNP). Higher inherent fraud risk.                                                   |

## Project Structure

- `Dataset.csv`: Source transaction data.
- `fraud_dashboard/`: Main application logic.
  - `analyze.py`: Machine learning model and data processing script.
  - `dashboard_app/`: React-based frontend application.
    - `public/`: Contains static assets and the generated analysis data.
    - `src/`: Application source code and components.

## Model Methodology

The fraud detection engine employs `sklearn.ensemble.IsolationForest`. This algorithm isolates observations by randomly selecting a feature and then randomly selecting a split value between the maximum and minimum values of the selected feature.

- **Contamination Factor**: Configured to 1% to target high-confidence anomalies.
- **Feature Vectors**: Distance from home, distance from last transaction, ratio to median price, retailer consistency, chip usage, PIN usage, and transaction type.
