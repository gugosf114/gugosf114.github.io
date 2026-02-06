#!/usr/bin/env python3
"""Convert JPG/PNG images to WebP format for better performance.
Only converts images that don't already have a WebP version.
Preserves originals as fallback for older browsers."""

import os
from pathlib import Path
from PIL import Image

BASE_DIR = Path(__file__).parent
QUALITY = 82  # Good balance of quality vs size
SKIP_DIRS = {'node_modules', '.git', '.claude'}

converted = 0
skipped = 0
total_saved = 0

for root, dirs, files in os.walk(BASE_DIR):
    # Skip excluded directories
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

    for fname in files:
        ext = fname.lower().rsplit('.', 1)[-1] if '.' in fname else ''
        if ext not in ('jpg', 'jpeg', 'png'):
            continue

        src = Path(root) / fname
        webp_path = src.with_suffix('.webp')

        # Skip if WebP already exists
        if webp_path.exists():
            skipped += 1
            continue

        try:
            with Image.open(src) as img:
                # Convert RGBA to RGB for JPG-sourced images (WebP supports both)
                if img.mode == 'RGBA' and ext in ('jpg', 'jpeg'):
                    img = img.convert('RGB')

                original_size = src.stat().st_size
                img.save(webp_path, 'WEBP', quality=QUALITY, method=4)
                new_size = webp_path.stat().st_size
                saved = original_size - new_size
                total_saved += saved
                converted += 1

                rel = src.relative_to(BASE_DIR)
                pct = (1 - new_size / original_size) * 100 if original_size > 0 else 0
                print(f"  {rel} -> .webp ({pct:.0f}% smaller)")
        except Exception as e:
            print(f"  ERROR: {src.relative_to(BASE_DIR)}: {e}")

print(f"\nDone! Converted {converted} images, skipped {skipped} (already had .webp)")
print(f"Total space saved: {total_saved / 1024 / 1024:.1f} MB")
