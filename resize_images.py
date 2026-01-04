#!/usr/bin/env python3
"""
Image Resize Script for Corporate Cookies
Resizes images larger than 1200px width to max 1200px width.
Maintains aspect ratio. Overwrites originals.
"""

import os
from pathlib import Path
from PIL import Image

# Configuration
GALLERY_PATH = Path("images/gallery/corporatecookies")
MAX_WIDTH = 1200

# Track results
resized_files = []
skipped_files = []
error_files = []


def format_size(size_bytes):
    """Format bytes to human-readable string."""
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.2f} MB"
    elif size_bytes >= 1024:
        return f"{size_bytes / 1024:.2f} KB"
    return f"{size_bytes} bytes"


def resize_image(filepath):
    """Resize image if width > MAX_WIDTH."""
    try:
        with Image.open(filepath) as img:
            original_width, original_height = img.size

            # Skip if already small enough
            if original_width <= MAX_WIDTH:
                skipped_files.append({
                    'path': filepath,
                    'width': original_width,
                    'height': original_height,
                    'reason': f'Width {original_width}px <= {MAX_WIDTH}px'
                })
                return

            # Calculate new dimensions
            ratio = MAX_WIDTH / original_width
            new_height = int(original_height * ratio)

            # Get original file size
            original_size = os.path.getsize(filepath)

            # Resize
            resized = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)

            # Determine format and save
            suffix = filepath.suffix.lower()
            if suffix in {'.jpg', '.jpeg'}:
                # Convert to RGB if necessary (handles RGBA)
                if resized.mode in ('RGBA', 'P', 'LA'):
                    resized = resized.convert('RGB')
                resized.save(filepath, 'JPEG', quality=85, optimize=True)
            elif suffix == '.png':
                resized.save(filepath, 'PNG', optimize=True)
            else:
                # For other formats, save as-is
                resized.save(filepath)

            new_size = os.path.getsize(filepath)

            resized_files.append({
                'path': filepath,
                'old_width': original_width,
                'old_height': original_height,
                'new_width': MAX_WIDTH,
                'new_height': new_height,
                'old_size': original_size,
                'new_size': new_size
            })

    except Exception as e:
        error_files.append({
            'path': filepath,
            'error': str(e)
        })


def main():
    print("=" * 60)
    print("IMAGE RESIZE SCRIPT")
    print("=" * 60)
    print(f"\nScanning: {GALLERY_PATH.absolute()}")
    print(f"Max width: {MAX_WIDTH}px")
    print()

    # Find all image files (skip HEIC as Pillow doesn't support it by default)
    image_extensions = {'.jpg', '.jpeg', '.png'}
    image_files = []

    for f in GALLERY_PATH.iterdir():
        if f.suffix.lower() in image_extensions:
            image_files.append(f)

    image_files.sort()

    print(f"Found {len(image_files)} supported image files\n")
    print("-" * 60)

    for filepath in image_files:
        print(f"Processing: {filepath.name}")
        resize_image(filepath)

    # Print summary
    print("\n" + "=" * 60)
    print("RESIZE SUMMARY")
    print("=" * 60)

    if resized_files:
        print(f"\nRESIZED FILES ({len(resized_files)}):")
        print("-" * 60)
        total_saved = 0
        for f in resized_files:
            saved = f['old_size'] - f['new_size']
            total_saved += saved
            print(f"  {f['path'].name}")
            print(f"    {f['old_width']}x{f['old_height']} -> {f['new_width']}x{f['new_height']}")
            print(f"    {format_size(f['old_size'])} -> {format_size(f['new_size'])} (saved {format_size(saved)})")
        print(f"\n  Total space saved: {format_size(total_saved)}")

    if skipped_files:
        print(f"\nSKIPPED FILES ({len(skipped_files)}):")
        print("-" * 60)
        for f in skipped_files:
            print(f"  {f['path'].name} ({f['width']}x{f['height']})")

    if error_files:
        print(f"\nERRORS ({len(error_files)}):")
        print("-" * 60)
        for f in error_files:
            print(f"  {f['path'].name}: {f['error']}")

    print("\n" + "=" * 60)
    print(f"Files resized: {len(resized_files)}")
    print(f"Files skipped: {len(skipped_files)}")
    print(f"Errors: {len(error_files)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
