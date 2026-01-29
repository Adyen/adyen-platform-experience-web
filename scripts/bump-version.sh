#!/bin/bash

RED='\033[1;31m'
NC='\033[0m'
BLUE='\033[1;34m'

# Check if the current branch is main
current_branch=$(git rev-parse --abbrev-ref HEAD)

if [ "$current_branch" != "main" ]; then
  echo -e "${RED}You are not on the main branch.${NC}"
  echo -e "Please ${BLUE}switch${NC} to the main branch and try again."
  exit 1
fi

pnpm run changeset -- version

new_version=$(jq -r '.version' package.json)

pnpm install
git add .
git commit -m "Bump to version $new_version"
git push origin "HEAD:bump/$new_version"

echo "Version bumped to $new_version"
echo "Changes committed and pushed to remote branch bump/$new_version"