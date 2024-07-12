#!/bin/bash

# Check if the current branch is main
current_branch=$(git rev-parse --abbrev-ref HEAD)


npm run version

new_version=$(grep '"version":' packages/lib/package.json | sed 's/.*: "\(.*\)".*/\1/')

npm install
git add .
git commit -m "Bump to version $new_version"
git push origin "HEAD:bump/$new_version"

echo "Version bumped to $new_version"
echo "Changes committed and pushed to remote branch bump/$new_version"