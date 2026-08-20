#!/usr/bin/env bash
#
# Build a Chrome Web Store ready zip for drawio-ai-sidebar-extension.
# Output: dist/drawio-ai-sidebar-v<version>.zip  (manifest.json at zip root)
#
# Usage: bash scripts/package.sh
set -euo pipefail

EXT_DIR="drawio-ai-sidebar-extension"
OUT_DIR="dist"

VERSION=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$EXT_DIR/manifest.json" | head -n 1)
if [[ -z "$VERSION" ]]; then
  echo "error: could not read version from $EXT_DIR/manifest.json" >&2
  exit 1
fi

ZIP_NAME="drawio-ai-sidebar-v${VERSION}.zip"
ZIP_PATH="$OUT_DIR/$ZIP_NAME"

mkdir -p "$OUT_DIR"
ABS_ZIP="$(cd "$OUT_DIR" && pwd)/$ZIP_NAME"
rm -f "$ZIP_PATH"

# List extension files explicitly so README / .DS_Store are excluded and
# manifest.json lands at the zip root. Add new extension files here.
cd "$EXT_DIR"
zip -r "$ABS_ZIP" manifest.json background.js content.js content.css >/dev/null

echo "packaged: $ZIP_PATH"
