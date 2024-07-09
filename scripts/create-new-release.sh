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

# Checkout to main and pull latest
# git checkout main
# git pull origin main

# Prompt for release type
echo "Select release type:"
while true; do
    display_options
    read_key || break
done

release_type="${options[$current_index]}"

dry_run_output=$(npx release-it --ci --increment $release_type --dry-run 2>&1)
new_version=$(echo "$dry_run_output" | sed -n 's/.*→ \(.*\)/\1/p')

echo "Type $release_type"
echo "Version $new_version"

# Create new branch with the new version
# git checkout -b "bump/$new_version"

# Run release-it
# npx release-it --ci --increment $release_type

# Update @adyen/adyen-platform-experience-web in packages/playground/package.json and packages/mocks/package.json
# sed -i '' "s/\"@adyen\/adyen-platform-experience-web\": \"[^\"]*\"/\"@adyen\/adyen-platform-experience-web\": \"$new_version\"/" packages/playground/package.json packages/mocks/package.json

# npm install

# git add .
# git commit -m "chore: update dependencies to version $new_version"
# git push origin "bump/$new_version"

echo "Version bumped to $new_version"
echo "Changes committed and pushed to remote branch bump/$new_version"