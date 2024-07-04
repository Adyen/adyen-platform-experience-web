#!/bin/bash

# Function to increment version
increment_version() {
    local version=$1
    local release=$2

    IFS='.' read -ra version_parts <<< "$version"
    major=${version_parts[0]}
    minor=${version_parts[1]}
    patch=${version_parts[2]}

    case $release in
        major)
            ((major++))
            minor=0
            patch=0
            ;;
        minor)
            ((minor++))
            patch=0
            ;;
        patch)
            ((patch++))
            ;;
        *)
            echo "Invalid release type"
            exit 1
            ;;
    esac

    echo "${major}.${minor}.${patch}"
}

# Checkout to main and pull latest
git checkout main
git pull origin main

# Prompt for release type
echo "Enter release type (major/minor/patch):"
read release_type

# Get current version from package.json
current_version=$(grep '"version":' packages/lib/package.json | sed 's/.*: "\(.*\)".*/\1/')

# Calculate new version
new_version=$(increment_version "$current_version" "$release_type")

# Create new branch
git checkout -b "bump/$new_version"

# Update version in packages/lib/package.json
sed -i '' "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" packages/lib/package.json
sed -i '' "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" package.json

# Update @adyen/adyen-platform-experience-web in packages/playground/package.json
sed -i '' "s/\"@adyen\/adyen-platform-experience-web\": \"[^\"]*\"/\"@adyen\/adyen-platform-experience-web\": \"$new_version\"/" packages/playground/package.json

# Update @adyen/adyen-platform-experience-web in packages/playground/package.json
sed -i '' "s/\"@adyen\/adyen-platform-experience-web\": \"[^\"]*\"/\"@adyen\/adyen-platform-experience-web\": \"$new_version\"/" packages/mocks/package.json

# Run npm install
npm install

# Git add all changes
git add .

# Git commit
git commit -m "Bump to version $new_version"

# Git push
git push origin "bump/$new_version"

echo "Version bumped to $new_version"
echo "Changes committed and pushed to remote branch bump/$new_version"