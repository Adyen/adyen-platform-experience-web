#!/bin/bash

set -e
trap 'rm -rf -- "$STAGING_DIR"' EXIT

# Determine the absolute path of the directory containing this script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &>/dev/null && pwd )

PROJECT_ROOT=$(dirname $(dirname "$SCRIPT_DIR"))

echo "Changing working directory to project root..."
cd "$PROJECT_ROOT"

ARCHIVE_NAME="platform-components-v1_cdn.tar.gz"
ASSETS_DIR="./src/assets"
CONFIG_DIR="./src/config"
CDN_BUILD_SCRIPT="build:cdn"
UMD_BUILD_SCRIPT="build:umd"

UMD_FILE="./dist/umd/index.js"
CSS_FILE="./dist/adyen-platform-experience-web.css"
CDN_COMPONENTS_DIR="./dist/cdn-components"

echo "Verifying required paths exist..."
if [ ! -d "$ASSETS_DIR" ]; then
  echo "Error: Assets directory not found at '$PROJECT_ROOT/$ASSETS_DIR'. Aborting" >&2
  exit 1
else
  echo "All paths verified"
fi

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

echo "Building CDN components..."
pnpm run "$CDN_BUILD_SCRIPT"
echo "CDN components build complete"

echo "Preparing staging directory for archive..."
# Create a temporary directory for staging
STAGING_DIR=$(mktemp -d)

echo "Copying assets to staging area..."
cp -r "$ASSETS_DIR" "$STAGING_DIR/assets"
rm -rf "$STAGING_DIR/assets/components"

echo "Copying config to staging area..."
cp -r "$CONFIG_DIR" "$STAGING_DIR/config"

if [ -d "$CDN_COMPONENTS_DIR" ]; then
  # If the directory is empty of visible files, the glob won't expand
  components=("$CDN_COMPONENTS_DIR"/*)

  if [ -e "${components[0]}" ]; then
    # There is at least one file in the directory
    echo "Copying CDN components to staging area..."
    cp -r "$CDN_COMPONENTS_DIR" "$STAGING_DIR/components"
  fi
fi

# Conditionally copy the UMD files based on the environment
if [ "$DEPLOY_ENV" != "live" ]; then
  echo "Copying UMD file..."
  cp "$UMD_FILE" "$STAGING_DIR/index.js"

  echo "Copying CSS file..."
  cp "$CSS_FILE" "$STAGING_DIR/adyen-platform-experience-web.css"
fi

echo "Creating archive: $ARCHIVE_NAME"
tar -czvf "$ARCHIVE_NAME" -C "$STAGING_DIR" .

echo "Cleaning up staging directory..."

echo "✅ Archive created successfully!"
echo "    -> $PROJECT_ROOT/$ARCHIVE_NAME"
