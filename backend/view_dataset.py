import os
import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image

DATASET = "../dataset/archive-2"

df = pd.read_csv(os.path.join(DATASET, "HAM10000_metadata.csv"))

image_dirs = [
    os.path.join(DATASET, "HAM10000_images_part_1"),
    os.path.join(DATASET, "HAM10000_images_part_2")
]

samples = df.sample(9, random_state=42)

plt.figure(figsize=(12, 12))

for i, (_, row) in enumerate(samples.iterrows()):
    image_id = row["image_id"]
    label = row["dx"]

    image_path = None

    for folder in image_dirs:
        path = os.path.join(folder, image_id + ".jpg")
        if os.path.exists(path):
            image_path = path
            break

    image = Image.open(image_path)

    plt.subplot(3, 3, i + 1)
    plt.imshow(image)
    plt.title(label)
    plt.axis("off")

plt.tight_layout()
plt.show()