#!/usr/bin/env python3
"""
Image Compression Script for Gallery
Compresses images larger than 500KB to reduce file sizes.
- JPEGs: re-saved at quality=80
- PNGs: compressed, or converted to JPEG if over 1MB
"""

import os
from pathlib import Path
from PIL import Image

# Configuration
GALLERY_PATH = Path("images/gallery")
SIZE_THRESHOLD = 500 * 1024  # 500KB in bytes
PNG_TO_JPEG_THRESHOLD = 1 * 1024 * 1024  # 1MB in bytes
JPEG_QUALITY = 80

# Track results
compressed_files = []
skipped_files = []
converted_files = []
total_saved = 0


def get_file_size(path):
    """Get file size in bytes."""
    return os.path.getsize(path)


def format_size(size_bytes):
    """Format bytes to human-readable string."""
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.2f} MB"
    elif size_bytes >= 1024:
        return f"{size_bytes / 1024:.2f} KB"
    return f"{size_bytes} bytes"


def compress_jpeg(filepath):
    """Compress a JPEG image by re-saving at lower quality."""
    global total_saved

    original_size = get_file_size(filepath)

    try:
        with Image.open(filepath) as img:
            # Preserve EXIF data if present
            exif = img.info.get('exif', None)

            # Convert to RGB if necessary (handles RGBA, P mode, etc.)
            if img.mode in ('RGBA', 'P', 'LA'):
                img = img.convert('RGB')

            # Save with compression
            if exif:
                img.save(filepath, 'JPEG', quality=JPEG_QUALITY, optimize=True, exif=exif)
            else:
                img.save(filepath, 'JPEG', quality=JPEG_QUALITY, optimize=True)

        new_size = get_file_size(filepath)
        saved = original_size - new_size
        total_saved += saved

        compressed_files.append({
            'path': filepath,
            'before': original_size,
            'after': new_size,
            'saved': saved
        })

        return True
    except Exception as e:
        print(f"  Error compressing {filepath}: {e}")
        return False


def compress_png(filepath):
    """Compress a PNG image. Convert to JPEG if over 1MB."""
    global total_saved

    original_size = get_file_size(filepath)

    try:
        with Image.open(filepath) as img:
            # Check if PNG has transparency
            has_transparency = img.mode in ('RGBA', 'LA') or \
                              (img.mode == 'P' and 'transparency' in img.info)

            # If over 1MB and no transparency, convert to JPEG
            if original_size > PNG_TO_JPEG_THRESHOLD and not has_transparency:
                new_filepath = filepath.with_suffix('.jpg')

                # Convert to RGB
                if img.mode != 'RGB':
                    img = img.convert('RGB')

                img.save(new_filepath, 'JPEG', quality=JPEG_QUALITY, optimize=True)

                new_size = get_file_size(new_filepath)
                saved = original_size - new_size
                total_saved += saved

                # Remove original PNG
                os.remove(filepath)

                converted_files.append({
                    'original_path': filepath,
                    'new_path': new_filepath,
                    'before': original_size,
                    'after': new_size,
                    'saved': saved
                })

                return True
            else:
                # Just optimize the PNG
                img.save(filepath, 'PNG', optimize=True)

                new_size = get_file_size(filepath)
                saved = original_size - new_size

                # Only count as compressed if we actually saved space
                if saved > 0:
                    total_saved += saved
                    compressed_files.append({
                        'path': filepath,
                        'before': original_size,
                        'after': new_size,
                        'saved': saved
                    })
                else:
                    # Restore original if no savings (shouldn't happen often)
                    skipped_files.append({
                        'path': filepath,
                        'size': original_size,
                        'reason': 'Already optimized'
                    })

                return True
    except Exception as e:
        print(f"  Error compressing {filepath}: {e}")
        return False


def scan_and_compress():
    """Scan gallery folder and compress large images."""
    print("=" * 60)
    print("IMAGE COMPRESSION SCRIPT")
    print("=" * 60)
    print(f"\nScanning: {GALLERY_PATH.absolute()}")
    print(f"Threshold: Files larger than {format_size(SIZE_THRESHOLD)}")
    print(f"JPEG quality: {JPEG_QUALITY}")
    print(f"PNG to JPEG conversion: Files over {format_size(PNG_TO_JPEG_THRESHOLD)}")
    print()

    # Find all image files
    image_extensions = {'.jpg', '.jpeg', '.png'}
    image_files = []

    for ext in image_extensions:
        image_files.extend(GALLERY_PATH.rglob(f'*{ext}'))
        image_files.extend(GALLERY_PATH.rglob(f'*{ext.upper()}'))

    # Remove duplicates (case-insensitive matching might cause this)
    image_files = list(set(image_files))
    image_files.sort()

    print(f"Found {len(image_files)} image files\n")
    print("-" * 60)

    for filepath in image_files:
        size = get_file_size(filepath)
        relative_path = filepath.relative_to(Path('.'))

        if size <= SIZE_THRESHOLD:
            skipped_files.append({
                'path': relative_path,
                'size': size,
                'reason': 'Under threshold'
            })
            continue

        print(f"Processing: {relative_path}")
        print(f"  Size: {format_size(size)}")

        suffix = filepath.suffix.lower()

        if suffix in {'.jpg', '.jpeg'}:
            compress_jpeg(filepath)
        elif suffix == '.png':
            compress_png(filepath)

        print()

    # Print summary
    print_summary()


def print_summary():
    """Print compression summary."""
    print("\n" + "=" * 60)
    print("COMPRESSION SUMMARY")
    print("=" * 60)

    # Compressed files
    if compressed_files:
        print(f"\n COMPRESSED FILES ({len(compressed_files)}):")
        print("-" * 60)
        for f in compressed_files:
            path = f['path'].relative_to(Path('.')) if hasattr(f['path'], 'relative_to') else f['path']
            print(f"  {path}")
            print(f"    Before: {format_size(f['before'])} -> After: {format_size(f['after'])}")
            print(f"    Saved: {format_size(f['saved'])} ({f['saved']*100//f['before']}%)")
    else:
        print("\n No files were compressed.")

    # Converted files (PNG to JPEG)
    if converted_files:
        print(f"\n CONVERTED PNG -> JPEG ({len(converted_files)}):")
        print("-" * 60)
        for f in converted_files:
            orig = f['original_path'].relative_to(Path('.')) if hasattr(f['original_path'], 'relative_to') else f['original_path']
            new = f['new_path'].relative_to(Path('.')) if hasattr(f['new_path'], 'relative_to') else f['new_path']
            print(f"  {orig} -> {new}")
            print(f"    Before: {format_size(f['before'])} -> After: {format_size(f['after'])}")
            print(f"    Saved: {format_size(f['saved'])} ({f['saved']*100//f['before']}%)")

    # Skipped files
    if skipped_files:
        print(f"\n SKIPPED FILES ({len(skipped_files)}):")
        print("-" * 60)
        for f in skipped_files:
            path = f['path'].relative_to(Path('.')) if hasattr(f['path'], 'relative_to') else f['path']
            print(f"  {path} ({format_size(f['size'])}) - {f['reason']}")

    # Total savings
    print("\n" + "=" * 60)
    print(f" TOTAL SPACE SAVED: {format_size(total_saved)}")
    print(f" Files compressed: {len(compressed_files)}")
    print(f" Files converted (PNG->JPEG): {len(converted_files)}")
    print(f" Files skipped: {len(skipped_files)}")
    print("=" * 60)


if __name__ == "__main__":
    scan_and_compress()
