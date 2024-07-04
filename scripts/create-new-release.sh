#!/bin/bash

options=("major" "minor" "patch")
current_index=0

display_options() {
  clear
  for i in "${!options[@]}"; do
    if [ $i -eq $current_index ]; then
      echo "\033[1;32m> ${options[$i]}\033[0m"
    else
      echo "  ${options[$i]}"
    fi
  done
}

# Function to handle keypresses
read_key() {
  read -sn1 key
  if [[ $key == $'\x1b' ]]; then
    read -sn2 key
    case "$key" in
      '[A') # Up arrow key
        ((current_index--))
        if [ $current_index -lt 0 ]; then
          current_index=$((${#options[@]} - 1))
        fi
        ;;
      '[B') # Down arrow key
        ((current_index++))
        if [ $current_index -ge ${#options[@]} ]; then
          current_index=0
        fi
        ;;
    esac
  elif [[ $key == "" ]]; then
    # Enter key
    return 1
  fi
  return 0
}

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
echo "Select release type:"

while true; do
  display_options
  read_key || break
done

release_type="${options[$current_index]}"

# Get current version from package.json
current_version=$(grep '"version":' packages/lib/package.json | sed 's/.*: "\(.*\)".*/\1/')

# Calculate new version
new_version=$(increment_version "$current_version" "$release_type")

# Create new branch
git checkout -b "bump/$new_version"

# Update version in package.json and packages/lib/package.json
sed -i '' "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" packages/lib/package.json
sed -i '' "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" package.json

# Update @adyen/adyen-platform-experience-web in packages/playground/package.json
sed -i '' "s/\"@adyen\/adyen-platform-experience-web\": \"[^\"]*\"/\"@adyen\/adyen-platform-experience-web\": \"$new_version\"/" packages/playground/package.json

# Update @adyen/adyen-platform-experience-web in packages/mocks/package.json
sed -i '' "s/\"@adyen\/adyen-platform-experience-web\": \"[^\"]*\"/\"@adyen\/adyen-platform-experience-web\": \"$new_version\"/" packages/mocks/package.json

npm install
git add .
git commit -m "Bump to version $new_version"
git push origin "bump/$new_version"

echo "Version bumped to $new_version"
echo "Changes committed and pushed to remote branch bump/$new_version"