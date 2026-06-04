import sys
import pandas as pd
from sklearn.tree import DecisionTreeClassifier

# 1. Training Dataset - Baseline Operational Boundaries
data = {
    'requestVolume': [50, 150, 320, 450, 600, 780, 850, 1000, 1200],
    'traffic_class': [0,  0,   0,   1,   1,   1,   2,   2,    2]
}
df = pd.DataFrame(data)

# 2. Extract Features and Labels
X = df[['requestVolume']]
y = df['traffic_class']

# 3. Instantiate and Fit the Model Architecture
model = DecisionTreeClassifier()
model.fit(X, y)

# 4. Command-Line Inference Handler for External Integrations
if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            input_volume = int(sys.argv[1])
            prediction = model.predict([[input_volume]])[0]
            
            # Map structural prediction integers back to legible risk statuses
            labels = {0: "NORMAL", 1: "WARNING: HIGH LOAD", 2: "CRITICAL: DDOS SATURATION RISK"}
            print(f"PREDICTION:{labels[prediction]}")
        except Exception as e:
            print(f"ERROR:{str(e)}")
    else:
        print("PREDICTION:UNKNOWN - Provide a volume metric.")
