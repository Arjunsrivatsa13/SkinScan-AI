import os
import pandas as pd

DATASET = "../dataset/archive-2"

df = pd.read_csv(os.path.join(DATASET, "HAM10000_metadata.csv"))

image_dirs = [
    os.path.join(DATASET, "HAM10000_images_part_1"),
    os.path.join(DATASET, "HAM10000_images_part_2")
]

found = 0
missing = 0

for image_id in df["image_id"]:
    filename = image_id + ".jpg"

    if any(os.path.exists(os.path.join(folder, filename)) for folder in image_dirs):
        found += 1
    else:
        missing += 1

print("Total images in metadata:", len(df))
print("Images found:", found)
print("Images missing:", missing)