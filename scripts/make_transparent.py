import os
from PIL import Image, ImageFilter

def make_cutout_pil(image_path, output_path, threshold=238):
    img = Image.open(image_path).convert("RGBA")
    w, h = img.size
    
    # Create mask image where white background will be flooded
    # We can floodfill on a temporary grayscale image
    gray = img.convert("L")
    # Mask: 0 = character, 255 = background
    # Binarize with threshold
    # If pixel is > threshold, it's white candidate
    mask = gray.point(lambda p: 255 if p >= threshold else 0, mode='1')
    
    # We want connected component from edges only
    # Let's use pure PIL:
    # Convert mask to L mode
    mask_l = mask.convert("L")
    
    # Use floodfill from (0,0) with value 128
    from PIL import ImageDraw
    ImageDraw.floodfill(mask_l, (0, 0), 128)
    ImageDraw.floodfill(mask_l, (w - 1, 0), 128)
    ImageDraw.floodfill(mask_l, (0, h - 1), 128)
    ImageDraw.floodfill(mask_l, (w - 1, h - 1), 128)
    
    # Any pixel with value 128 is outer background.
    # Pixels with value 255 were white inside the character (e.g. eyes, teeth, clothes) and should NOT be transparent.
    # Convert outer background (128) to 0 alpha, everything else to 255 alpha.
    alpha = mask_l.point(lambda p: 0 if p == 128 else 255, mode='L')
    
    # Slight blur to soften edges
    alpha_soft = alpha.filter(ImageFilter.GaussianBlur(radius=0.8))
    
    # Apply alpha channel
    img.putalpha(alpha_soft)
    img.save(output_path, "PNG")
    print(f"Successfully processed {image_path} -> {output_path}")

images = [
    ("assets/images/challenge_fatburn_3d.jpg", "assets/images/challenge_fatburn_3d.png"),
    ("assets/images/challenge_purple_3d.jpg", "assets/images/challenge_purple_3d.png"),
    ("assets/images/challenge_rebuild_3d.jpg", "assets/images/challenge_rebuild_3d.png"),
]

for src, dst in images:
    if os.path.exists(src):
        make_cutout_pil(src, dst)
    else:
        print(f"File not found: {src}")
