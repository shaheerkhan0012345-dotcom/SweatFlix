import os
from PIL import Image

def optimize_pngs():
    png_files = [
        'assets/images/challenge_fatburn_3d.png',
        'assets/images/challenge_purple_3d.png',
        'assets/images/challenge_rebuild_3d.png',
    ]
    for p in png_files:
        if os.path.exists(p):
            orig_size = os.path.getsize(p) / 1024
            img = Image.open(p)
            # If large, resize to retina mobile dimension
            w, h = img.size
            if w > 500 or h > 700:
                img = img.resize((w // 2, h // 2), Image.Resampling.LANCZOS)
            img.save(p, format='PNG', optimize=True)
            new_size = os.path.getsize(p) / 1024
            print(f'Optimized PNG {p}: {orig_size:.1f}KB -> {new_size:.1f}KB')

def optimize_meals():
    meals_dir = 'assets/images/meals'
    if not os.path.exists(meals_dir):
        return
    for fname in os.listdir(meals_dir):
        if fname.lower().endswith(('.jpg', '.jpeg')):
            full_path = os.path.join(meals_dir, fname)
            orig_size = os.path.getsize(full_path) / 1024
            if orig_size > 200:
                img = Image.open(full_path)
                w, h = img.size
                if w > 800:
                    img = img.resize((w // 2, h // 2), Image.Resampling.LANCZOS)
                img.save(full_path, format='JPEG', quality=85, optimize=True)
                new_size = os.path.getsize(full_path) / 1024
                print(f'Optimized Meal {fname}: {orig_size:.1f}KB -> {new_size:.1f}KB')

if __name__ == '__main__':
    optimize_pngs()
    optimize_meals()
