import sys
import pandas as pd
from prophet import Prophet
import json

# Read JSON input passed via stdin
input_data = json.loads(sys.stdin.read())

# Create DataFrame
df = pd.DataFrame(input_data)
#df = pd.read_csv('C:/Users/GnaR26/Downloads/synthetic_cash_flow_data.csv')

# Ensure columns: date, inflows, outflows
df['date'] = pd.to_datetime(df['date'])

# --- Predict INFLOWS ---
inflow_df = df[['date', 'inflows']].rename(columns={'date': 'ds', 'inflows': 'y'})
model_inflow = Prophet()
model_inflow.fit(inflow_df)
future_inflows = model_inflow.make_future_dataframe(periods=365)  # next 30 days
forecast_inflows = model_inflow.predict(future_inflows)
forecast_inflows = forecast_inflows[['ds', 'yhat']].rename(columns={'yhat': 'predicted_inflows'})

# --- Predict OUTFLOWS ---
outflow_df = df[['date', 'outflows']].rename(columns={'date': 'ds', 'outflows': 'y'})
model_outflow = Prophet()
model_outflow.fit(outflow_df)
future_outflows = model_outflow.make_future_dataframe(periods=365)
forecast_outflows = model_outflow.predict(future_outflows)
forecast_outflows = forecast_outflows[['ds', 'yhat']].rename(columns={'yhat': 'predicted_outflows'})

# --- Merge predictions ---
forecast = pd.merge(forecast_inflows, forecast_outflows, on='ds')
forecast['ds'] = forecast['ds'].dt.strftime('%Y-%m-%d')

# --- Calculate balances ---
last_date = df['date'].max()
last_inflows = df[df['date'] == last_date]['inflows'].values[0]
last_outflows = df[df['date'] == last_date]['outflows'].values[0]
last_balance = float(last_inflows) - float(last_outflows)
cumulative_balance = last_balance

predicted_records = []
for index, row in forecast.iterrows():
    opening = float(cumulative_balance)
    
    inflow = max(0.0, float(row['predicted_inflows']))
    outflow = max(0.0, float(row['predicted_outflows']))
    
    closing = opening + inflow - outflow

    closing = max(0.0, closing)

    cumulative_balance = closing

    predicted_records.append({
        'date': str(row['ds']),
        'openingBalance': round(opening, 2),
        'totalInflows': round(inflow, 2),
        'totalOutflows': round(outflow, 2),
        'closingBalance': round(closing, 2)
    })

# --- Output JSON ---
print(json.dumps(predicted_records, indent=2))
