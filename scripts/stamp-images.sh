#!/usr/bin/env bash
# Writes owner + license data INSIDE every gallery image (IPTC/XMP) so Google Images and
# other readers see who made it. Skips files already stamped. Runs at deploy; needs exiftool.
set -euo pipefail
cd "$(dirname "$0")/.."
LICENSE="https://mybakingcreations.com/image-license"
find images -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) -print0 \
 | xargs -0 exiftool -q -q -overwrite_original -if 'not $XMP-xmpRights:WebStatement' \
   -XMP-dc:Creator='My Baking Creations' -XMP-dc:Rights='© My Baking Creations. All rights reserved.' \
   -XMP-xmpRights:Marked=true -XMP-xmpRights:WebStatement="$LICENSE" -XMP-plus:LicensorURL="$LICENSE" \
   -XMP-photoshop:Credit='My Baking Creations' -XMP-photoshop:Source='mybakingcreations.com' \
   -IPTC:By-line='My Baking Creations' -IPTC:CopyrightNotice='© My Baking Creations. All rights reserved.' -IPTC:Credit='My Baking Creations' \
   || true
echo "stamp-images: done"
