#!/bin/bash

current_version=$(grep '"version":' packages/lib/package.json | sed 's/.*: "\(.*\)".*/\1/')

new_version=$1

# Update @adyen/adyen-platform-experience-web in packages/playground/package.json and packages/mocks/package.json

sed -i '' "s/\"@adyen\/adyen-platform-experience-web\": \"[^\"]*\"/\"@adyen\/adyen-platform-experience-web\": \"$new_version\"/" packages/playground/package.json packages/mocks/package.json

sed -i '' "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" packages/lib/package.json

npm install
