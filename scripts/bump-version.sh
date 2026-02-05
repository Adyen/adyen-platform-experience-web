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

# Check the current package version
current_version=$(jq -r '.version' package.json)

npm run changeset -- version

# Check the newly bumped package version
new_version=$(jq -r '.version' package.json)

if [ "$new_version" == "$current_version" ]; then
  echo -e "${RED}No version bump available.${NC}"
  exit 1
fi

bump_branch="bump/$new_version"

npm install
git add .
git commit -m "Bump to version $new_version"
git push origin "HEAD:$bump_branch" || { echo -e "${RED}Failed to push to remote branch $bump_branch${NC}"; exit 1; }
git reset --hard HEAD~1

echo "Version bumped to $new_version"
echo "Changes committed and pushed to remote branch $bump_branch"