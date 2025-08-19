#!/bin/bash

set -e

# Determine the absolute path of the directory containing this script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

PROJECT_ROOT=$(dirname $(dirname "$SCRIPT_DIR"))

echo "Changing working directory to project root..."

cd "$PROJECT_ROOT"

ARCHIVE_NAME="platform-components-v1_cdn.tar.gz"
BUILD_SCRIPT="build:umd"
ASSETS_DIR="./src/assets"
UMD_FILE="./dist/umd/index.js"
STAGING_DIR="./archive_staging" # A temporary directory for preparing the archive

echo "Running the build process from directory: $(pwd)"
npm run "$BUILD_SCRIPT"
echo "Build complete"

echo "Verifying required paths exist..."
if [ ! -d "$ASSETS_DIR" ]; then
  echo "Error: Assets directory not found at '$PROJECT_ROOT/$ASSETS_DIR'. Aborting"
  exit 1
fi
if [ ! -f "$UMD_FILE" ]; then
  echo "Error: UMD file not found at '$PROJECT_ROOT/$UMD_FILE'. Aborting"
  exit 1
fi
echo "All paths verified"

echo "Preparing staging directory for archive"

rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"

echo "Copying assets to staging area..."
cp -r "$ASSETS_DIR" "$STAGING_DIR/assets"
cp "$UMD_FILE" "$STAGING_DIR/index.js"

echo "Creating archive: $ARCHIVE_NAME"

tar -czvf "$ARCHIVE_NAME" -C "$STAGING_DIR" .

echo "Cleaning up staging directory..."
rm -rf "$STAGING_DIR"

echo "✅ Archive created successfully!"
echo "    -> $PROJECT_ROOT/$ARCHIVE_NAME"

