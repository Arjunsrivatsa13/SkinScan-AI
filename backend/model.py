import torch.nn as nn
from torchvision import models

def create_model(num_classes=7):
    model = models.resnet50(
        weights=models.ResNet50_Weights.DEFAULT
    )

    for param in model.parameters():
        param.requires_grad = False

    model.fc = nn.Linear(
        model.fc.in_features,
        num_classes
    )

    return model