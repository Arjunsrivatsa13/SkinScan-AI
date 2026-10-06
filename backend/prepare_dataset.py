import os
import pandas as pd
from sklearn.model_selection import train_test_split

DATASET = "../dataset/archive-2"

df = pd.read_csv(
    os.path.join(DATASET, "HAM10000_metadata.csv")
)

# First split: 80% train, 20% temporary
train_df, temp_df = train_test_split(
    df,
    test_size=0.20,
    stratify=df["dx"],
    random_state=42
)

# Second split: 10% validation, 10% test
val_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    stratify=temp_df["dx"],
    random_state=42
)

os.makedirs("../dataset/splits", exist_ok=True)

train_df.to_csv("../dataset/splits/train.csv", index=False)
val_df.to_csv("../dataset/splits/val.csv", index=False)
test_df.to_csv("../dataset/splits/test.csv", index=False)

print("Train:", len(train_df))
print("Validation:", len(val_df))
print("Test:", len(test_df))