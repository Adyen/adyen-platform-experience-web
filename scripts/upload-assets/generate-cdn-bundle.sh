#!/bin/bash

set -e
trap 'rm -rf -- "$STAGING_DIR"' EXIT

# Determine the absolute path of the directory containing this script
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

PROJECT_ROOT=$(dirname $(dirname "$SCRIPT_DIR"))

echo "Changing working directory to project root..."

cd "$PROJECT_ROOT"
if [[ -z "$VERSION" ]]; then
  echo "Error: VERSION environment variable is not set. Aborting." >&2
  exit 1
fi

ARCHIVE_NAME="platform-components_cdn_$VERSION.tar.gz"
BUILD_SCRIPT="build:cdn"
CDN_DIR="./dist-cdn"
ENTRY_FILE="$CDN_DIR/adyen-platform-experience-web.js"
CHUNKS_DIR="$CDN_DIR/chunks"
CSS_FILE="$CDN_DIR/adyen-platform-experience-web.css"
STAGING_DIR=$(mktemp -d)

echo "Running the build process from directory: $(pwd)"
pnpm run "$BUILD_SCRIPT"
echo "Build complete"

for REQUIRED_PATH in "$ENTRY_FILE" "$CHUNKS_DIR" "$CSS_FILE"; do
  if [[ ! -e "$REQUIRED_PATH" ]]; then
    echo "Error: CDN build output not found at \"$PROJECT_ROOT/$REQUIRED_PATH\". Aborting" >&2
    exit 1
  fi
done

cp "$ENTRY_FILE" "$STAGING_DIR/adyen-platform-experience-web.js"
cp -r "$CHUNKS_DIR" "$STAGING_DIR/chunks"
cp "$CSS_FILE" "$STAGING_DIR/adyen-platform-experience-web.css"

echo "Creating archive: $ARCHIVE_NAME"

tar -czvf "$ARCHIVE_NAME" -C "$STAGING_DIR" .

echo "✅ Archive created successfully!"
echo "-> $PROJECT_ROOT/$ARCHIVE_NAME"
