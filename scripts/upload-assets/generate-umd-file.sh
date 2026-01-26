#!/bin/bash

set -e
trap 'rm -rf -- "$STAGING_DIR"' EXIT

# Determine the absolute path of the directory containing this script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

PROJECT_ROOT=$(dirname $(dirname "$SCRIPT_DIR"))

echo "Changing working directory to project root..."

cd "$PROJECT_ROOT"
if [ -z "$VERSION" ]; then
  echo "Error: VERSION environment variable is not set. Aborting." >&2
  exit 1
fi

ARCHIVE_NAME="platform-components_cdn_$VERSION.tar.gz"
BUILD_SCRIPT="build:umd"
UMD_FILE="./dist/umd/index.js"
CSS_FILE="./dist/adyen-platform-experience-web.css"
STAGING_DIR=$(mktemp -d)

echo "Running the build process from directory: $(pwd)"
pnpm run "$BUILD_SCRIPT"
echo "Build complete"

if [ ! -f "$UMD_FILE" ]; then
  echo "Error: UMD file not found at \"$PROJECT_ROOT/$UMD_FILE\". Aborting" >&2
  exit 1
fi

cp "$UMD_FILE" "$STAGING_DIR/adyen-platform-experience-web.js"
cp "$CSS_FILE" "$STAGING_DIR/adyen-platform-experience-web.css"

echo "Creating archive: $ARCHIVE_NAME"

tar -czvf "$ARCHIVE_NAME" -C "$STAGING_DIR" .

echo "✅ Archive created successfully!"
echo "-> $PROJECT_ROOT/$ARCHIVE_NAME"
