#!/bin/bash

set -e
trap 'rm -rf -- "$STAGING_DIR"' EXIT

# Determine the absolute path of the directory containing this script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

PROJECT_ROOT=$(dirname $(dirname "$SCRIPT_DIR"))

echo "Changing working directory to project root..."

cd "$PROJECT_ROOT"

ARCHIVE_NAME="platform-components-v1_cdn.tar.gz"
BUILD_SCRIPT="build:umd"
ASSETS_DIR="./src/assets"
CONFIG_DIR="./src/config"
UMD_FILE="./dist/umd/index.js"
CSS_FILE="./dist/adyen-platform-experience-web.css"
STAGING_DIR=$(mktemp -d)

echo "Running the build process from directory: $(pwd)"
pnpm run "$BUILD_SCRIPT"
echo "Build complete"

echo "Verifying required paths exist..."
if [ ! -d "$ASSETS_DIR" ]; then
  echo "Error: Assets directory not found at '$PROJECT_ROOT/$ASSETS_DIR'. Aborting" >&2
  exit 1
fi
if [ ! -f "$UMD_FILE" ]; then
  echo "Error: UMD file not found at '$PROJECT_ROOT/$UMD_FILE'. Aborting" >&2
  exit 1
fi
echo "All paths verified"

echo "Preparing staging directory for archive"

echo "Copying assets to staging area..."
cp -r "$ASSETS_DIR" "$STAGING_DIR/assets"

# Conditionally copy the UMD file based on the environment
if [ "$DEPLOY_ENV" != "live" ]; then
  echo "Copying UMD file..."
  cp "$UMD_FILE" "$STAGING_DIR/index.js"
  echo "Copying CSS file..."
  if [ ! -f "$CSS_FILE" ]; then
    echo "Error: CSS file not found at \"$PROJECT_ROOT/$CSS_FILE\". Aborting" >&2
    exit 1
  fi
  cp "$CSS_FILE" "$STAGING_DIR/adyen-platform-experience-web.css"
else
  echo "Skipping UMD and CSS files copy for LIVE environment."
fi

cp -r "$CONFIG_DIR" "$STAGING_DIR/config"

echo "Creating archive: $ARCHIVE_NAME"

tar -czvf "$ARCHIVE_NAME" -C "$STAGING_DIR" .

echo "Cleaning up staging directory..."

echo "✅ Archive created successfully!"
echo "    -> $PROJECT_ROOT/$ARCHIVE_NAME"

