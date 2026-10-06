import os
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.utils.class_weight import compute_class_weight

from dataset import SkinLesionDataset, train_transform, val_transform
from model import create_model


# =========================
# CONFIG
# =========================

DATASET = "../dataset/archive-2"

TRAIN_CSV = "../dataset/splits/train.csv"
VAL_CSV = "../dataset/splits/val.csv"

MODEL_PATH = "../models/skin_lesion_resnet50_best.pth"

BATCH_SIZE = 16
EPOCHS = 10
LEARNING_RATE = 0.0001


# =========================
# DEVICE
# =========================

device = torch.device(
    "mps" if torch.backends.mps.is_available() else "cpu"
)

print("Using device:", device)


# =========================
# DATASETS
# =========================

train_dataset = SkinLesionDataset(
    TRAIN_CSV,
    DATASET,
    transform=train_transform
)

val_dataset = SkinLesionDataset(
    VAL_CSV,
    DATASET,
    transform=val_transform
)

print("Training images:", len(train_dataset))
print("Validation images:", len(val_dataset))
print("Classes:", train_dataset.classes)


train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# =========================
# MODEL
# =========================

model = create_model(
    num_classes=len(train_dataset.classes)
)


# Freeze everything first
for param in model.parameters():
    param.requires_grad = False


# Unfreeze layer4 + classifier
for param in model.layer4.parameters():
    param.requires_grad = True

for param in model.fc.parameters():
    param.requires_grad = True


model = model.to(device)


# =========================
# CLASS WEIGHTS
# =========================

classes = np.array(train_dataset.classes)

class_weights = compute_class_weight(
    class_weight="balanced",
    classes=classes,
    y=train_dataset.data["dx"]
)

class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
).to(device)

print("Class weights:", class_weights)


# =========================
# LOSS + OPTIMIZER
# =========================

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)

optimizer = torch.optim.AdamW(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=LEARNING_RATE,
    weight_decay=1e-4
)

scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=2
)


# =========================
# TRAINING
# =========================

best_val_accuracy = 0.0

for epoch in range(EPOCHS):

    print(f"\nEpoch {epoch + 1}/{EPOCHS}")

    # ---------------------
    # TRAIN
    # ---------------------

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        correct += (
            predictions == labels
        ).sum().item()

        total += labels.size(0)

    train_loss = running_loss / len(train_loader)
    train_accuracy = correct / total * 100


    # ---------------------
    # VALIDATION
    # ---------------------

    model.eval()

    correct = 0
    total = 0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            predictions = torch.argmax(
                outputs,
                dim=1
            )

            correct += (
                predictions == labels
            ).sum().item()

            total += labels.size(0)

    val_accuracy = correct / total * 100


    print(
        f"Train Loss: {train_loss:.4f}"
    )

    print(
        f"Train Accuracy: {train_accuracy:.2f}%"
    )

    print(
        f"Validation Accuracy: {val_accuracy:.2f}%"
    )


    # ---------------------
    # LR SCHEDULER
    # ---------------------

    scheduler.step(val_accuracy)


    # ---------------------
    # SAVE BEST MODEL
    # ---------------------

    if val_accuracy > best_val_accuracy:

        best_val_accuracy = val_accuracy

        torch.save(
            {
                "model_state_dict": model.state_dict(),
                "classes": train_dataset.classes,
                "val_accuracy": val_accuracy
            },
            MODEL_PATH
        )

        print("🔥 Best model saved!")


print("\nTraining complete!")
print(
    f"Best validation accuracy: "
    f"{best_val_accuracy:.2f}%"
)