import os
from dataset import SkinLesionDataset, train_transform

DATASET = "../dataset/archive-2"

train_dataset = SkinLesionDataset(
    "../dataset/splits/train.csv",
    DATASET,
    transform=train_transform
)

image, label = train_dataset[0]

print("Dataset size:", len(train_dataset))
print("Image shape:", image.shape)
print("Label:", label)
print("Classes:", train_dataset.classes)s