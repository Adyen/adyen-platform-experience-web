#!/bin/bash

set -e
trap 'rm -rf -- "$STAGING_DIR"' EXIT

if [ -z "$VERSION" ]; then
  echo "Error: VERSION environment variable is not set. Aborting." >&2
  exit 1
fi

# Determine the absolute path of the directory containing this script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &>/dev/null && pwd )

PROJECT_ROOT=$(dirname $(dirname "$SCRIPT_DIR"))

echo "Changing working directory to project root..."
cd "$PROJECT_ROOT"

ARCHIVE_NAME="platform-components_cdn_$VERSION.tar.gz"
UMD_BUILD_SCRIPT="build:umd"
UMD_FILE="./dist/umd/index.js"
CSS_FILE="./dist/adyen-platform-experience-web.css"

echo "Building UMD file from directory: $(pwd)"
pnpm run "$UMD_BUILD_SCRIPT"

if [ ! -f "$UMD_FILE" ]; then
  echo "Error: UMD file not found at '$PROJECT_ROOT/$UMD_FILE'. Aborting" >&2
  exit 1
elif [ ! -f "$CSS_FILE" ]; then
  echo "Error: CSS file not found at \"$PROJECT_ROOT/$CSS_FILE\". Aborting" >&2
  exit 1
else
  echo "UMD build complete"
fi

echo "Preparing staging directory for archive..."
# Create a temporary directory for staging
STAGING_DIR=$(mktemp -d)

echo "Copying UMD file..."
cp "$UMD_FILE" "$STAGING_DIR/adyen-platform-experience-web.js"

echo "Copying CSS file..."
cp "$CSS_FILE" "$STAGING_DIR/adyen-platform-experience-web.css"

echo "Creating archive: $ARCHIVE_NAME"
tar -czvf "$ARCHIVE_NAME" -C "$STAGING_DIR" .

echo "Cleaning up staging directory..."

echo "✅ Archive created successfully!"
echo "-> $PROJECT_ROOT/$ARCHIVE_NAME"
