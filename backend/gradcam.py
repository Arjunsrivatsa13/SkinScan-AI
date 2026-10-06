import torch
import numpy as np
import torch.nn.functional as F
import cv2


def generate_gradcam(
    model,
    image_tensor,
    original_image,
    target_class
):

    device = next(model.parameters()).device

    target_layer = model.layer4[-1]

    # Grad-CAM requires gradients
    for param in target_layer.parameters():
        param.requires_grad = True

    activations = None
    gradients = None

    def forward_hook(module, input, output):
        nonlocal activations
        activations = output

    def backward_hook(module, grad_input, grad_output):
        nonlocal gradients
        gradients = grad_output[0]

    forward_handle = target_layer.register_forward_hook(
        forward_hook
    )

    backward_handle = target_layer.register_full_backward_hook(
        backward_hook
    )

    try:

        model.zero_grad()

        # Make sure Grad-CAM is NOT running under no_grad
        with torch.enable_grad():

            output = model(image_tensor)

            score = output[0, target_class]

            score.backward()

        if activations is None:
            raise RuntimeError(
                "Grad-CAM could not capture activations."
            )

        if gradients is None:
            raise RuntimeError(
                "Grad-CAM could not capture gradients."
            )

        # Average gradients across spatial dimensions
        weights = gradients.mean(
            dim=(2, 3),
            keepdim=True
        )

        # Weighted feature maps
        cam = (
            weights * activations
        ).sum(dim=1, keepdim=True)

        # Keep positive activations
        cam = F.relu(cam)

        # Resize to 224x224
        cam = F.interpolate(
            cam,
            size=(224, 224),
            mode="bilinear",
            align_corners=False
        )

        cam = cam[0, 0]

        # Normalize
        cam -= cam.min()

        if cam.max() > 0:
            cam /= cam.max()

        grayscale_cam = (
            cam.detach()
            .cpu()
            .numpy()
        )

        # Original image
        image = np.array(
            original_image.resize((224, 224))
        ).astype(np.float32) / 255.0

        # Heatmap
        heatmap = cv2.applyColorMap(
            np.uint8(255 * grayscale_cam),
            cv2.COLORMAP_JET
        )

        heatmap = cv2.cvtColor(
            heatmap,
            cv2.COLOR_BGR2RGB
        )

        heatmap = (
            heatmap.astype(np.float32) / 255.0
        )

        # Overlay
        visualization = (
            0.5 * image +
            0.5 * heatmap
        )

        visualization = np.clip(
            visualization,
            0,
            1
        )

        return np.uint8(
            visualization * 255
        )

    finally:

        forward_handle.remove()
        backward_handle.remove()