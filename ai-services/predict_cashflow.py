import sys
import pandas as pd
from prophet import Prophet
import json

# Read JSON input passed via stdin
input_data = json.loads(sys.stdin.read())

# Create DataFrame
df = pd.DataFrame(input_data)

# Prophet needs two columns: ds (date), y (value)
df = df.rename(columns={'date': 'ds', 'cashflow': 'y'})

# Initialize Prophet
model = Prophet()
model.fit(df)

# Make future dataframe for next 12 months
future = model.make_future_dataframe(periods=365)

# Predict
forecast = model.predict(future)

# We care about ds (date) and yhat (prediction)
results = forecast[['ds', 'yhat']].tail(365).copy()
results['ds'] = results['ds'].dt.strftime('%Y-%m-%d')

# Detect alerts
alerts = []
for index, row in results.iterrows():
    if row['yhat'] < 0:
        alerts.append({'date': row['ds'], 'type': 'risk_of_overdraft', 'predicted_cashflow': row['yhat']})
    elif row['yhat'] > 10000:
        alerts.append({'date': row['ds'], 'type': 'investment_opportunity', 'predicted_cashflow': row['yhat']})


# Output the results
output = {
    'forecast': results.to_dict(orient='records'),
    'alerts': alerts
}

print(json.dumps(output))
