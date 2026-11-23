from pathlib import Path

import torch
from PIL import Image
from torchvision import transforms
from transformers import AutoModelForImageSegmentation

script_dir = Path(__file__).resolve().parent
input_dir = script_dir / "input"
output_dir = script_dir / "output"
supported_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tif", ".tiff"}

# Apple Silicon GPU gebruiken indien beschikbaar
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

print(f"Using device: {device}")

# Load BiRefNet
model = AutoModelForImageSegmentation.from_pretrained(
    "ZhengPeng7/BiRefNet",
    trust_remote_code=True
)

# float32: BiRefNet weights can land as float16; MPS then fails on float32 inputs
model.to(device)
model.float()
model.eval()

transform = transforms.Compose([
    transforms.Resize((1024, 1024)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

input_dir.mkdir(parents=True, exist_ok=True)
output_dir.mkdir(parents=True, exist_ok=True)
image_paths = sorted(
    path for path in input_dir.iterdir()
    if path.is_file() and path.suffix.lower() in supported_extensions
)

if not image_paths:
    print(f"No supported images found in {input_dir}")

for image_path in image_paths:
    with Image.open(image_path) as source_image:
        image = source_image.convert("RGB")

    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        preds = model(input_tensor)[-1].sigmoid().cpu()

    mask = preds[0].squeeze()
    mask = transforms.ToPILImage()(mask)
    mask = mask.resize(image.size)

    output = image.convert("RGBA")
    output.putalpha(mask)

    output_path = output_dir / f"{image_path.stem}.png"
    output.save(output_path)
    print(f"Saved: {output_path}")