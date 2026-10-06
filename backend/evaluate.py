import os
import torch
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report, confusion_matrix

from dataset import SkinLesionDataset, val_transform
from model import create_model


DATASET = "../dataset/archive-2"
TEST_CSV = "../dataset/splits/test.csv"
MODEL_PATH = "../models/skin_lesion_resnet50_best.pth"

device = torch.device(
    "mps" if torch.backends.mps.is_available() else "cpu"
)

print("Using device:", device)

test_dataset = SkinLesionDataset(
    TEST_CSV,
    DATASET,
    transform=val_transform
)

test_loader = DataLoader(
    test_dataset,
    batch_size=16,
    shuffle=False,
    num_workers=0
)

model = create_model(num_classes=7)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device
)

model.load_state_dict(checkpoint["model_state_dict"])
model = model.to(device)
model.eval()

all_predictions = []
all_labels = []

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(device)

        outputs = model(images)
        predictions = torch.argmax(outputs, dim=1)

        all_predictions.extend(predictions.cpu().numpy())
        all_labels.extend(labels.numpy())

print("\nClassification Report:\n")

print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=test_dataset.classes,
        zero_division=0
    )
)

print("Confusion Matrix:\n")

print(
    confusion_matrix(
        all_labels,
        all_predictions
    )
)