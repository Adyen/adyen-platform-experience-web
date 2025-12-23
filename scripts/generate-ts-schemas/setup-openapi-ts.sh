#!/bin/bash

# Define the path to the variables file
SCRIPT_DIR=$(dirname "$0")

SECRETS_PATH="${SCRIPT_DIR}/variables"

# Values
FOLDER_PATH="specs/platform-components-external"
CA_CERTS=$(npm config get cafile)


if [ -z "$REPO_TOKEN" ] || [ -z "$REPO_URL" ] || [ -z "$PROJECT_ID" ]; then

    read -sp "Enter your GitLab API token: " REPO_TOKEN
    echo

    read -sp "Enter the repo URL: " REPO_URL
    echo

    read -sp "Enter the project ID: " PROJECT_ID
    echo

fi

# Create the .env file with the input and hardcoded values
echo "API_TOKEN=$REPO_TOKEN" > "$SECRETS_PATH"
echo "PROJECT_ID=$PROJECT_ID" >> "$SECRETS_PATH"
echo "FOLDER_PATH=$FOLDER_PATH" >> "$SECRETS_PATH"
echo "REPO_URL=$REPO_URL" >> "$SECRETS_PATH"
echo "CA_CERTS=$CA_CERTS" >> "$SECRETS_PATH"

echo "✓✓✓✓✓ Variables file created at $SECRETS_PATH"
