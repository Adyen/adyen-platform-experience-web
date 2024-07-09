#!/bin/bash

# Check if the new version argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <new_version>"
  exit 1
fi

# Capture the new version from the first argument
new_version=$1

# Get the current version from packages/lib/package.json
current_version=$(grep '"version":' packages/lib/package.json | sed 's/.*"version": "\(.*\)".*/\1/')

if [ -z "$current_version" ]; then
  echo "Error: Unable to find the current version in packages/lib/package.json"
  exit 1
fi

# Update the @adyen/adyen-platform-experience-web version in packages/playground/package.json and packages/mocks/package.json
sed -i.bak "s/\"@adyen\/adyen-platform-experience-web\": \"[^\"]*\"/\"@adyen\/adyen-platform-experience-web\": \"$new_version\"/" packages/playground/package.json packages/mocks/package.json

# Update the version in packages/lib/package.json
sed -i.bak "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" packages/lib/package.json

# Install npm packages
npm install

# Clean up backup files created by sed
rm packages/playground/package.json.bak packages/mocks/package.json.bak packages/lib/package.json.bak