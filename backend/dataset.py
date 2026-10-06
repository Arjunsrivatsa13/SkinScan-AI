import os
import pandas as pd
from PIL import Image
from torch.utils.data import Dataset
from torchvision import transforms


class SkinLesionDataset(Dataset):

    def __init__(self, csv_file, dataset_dir, transform=None):
        self.data = pd.read_csv(csv_file)
        self.dataset_dir = dataset_dir
        self.transform = transform

        self.classes = sorted(self.data["dx"].unique())
        self.class_to_idx = {
            cls: idx for idx, cls in enumerate(self.classes)
        }

        self.image_dirs = [
            os.path.join(dataset_dir, "HAM10000_images_part_1"),
            os.path.join(dataset_dir, "HAM10000_images_part_2")
        ]

    def __len__(self):
        return len(self.data)

    def __getitem__(self, index):
        row = self.data.iloc[index]

        image_id = row["image_id"]
        label = row["dx"]

        image_path = None

        for folder in self.image_dirs:
            path = os.path.join(folder, image_id + ".jpg")

            if os.path.exists(path):
                image_path = path
                break

        if image_path is None:
            raise FileNotFoundError(
                f"Image not found: {image_id}"
            )

        image = Image.open(image_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        label = self.class_to_idx[label]

        return image, label


train_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(20),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2
    ),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])