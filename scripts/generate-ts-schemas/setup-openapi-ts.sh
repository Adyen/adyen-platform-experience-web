#!/bin/bash

# Define the path to the variables file
SCRIPT_DIR=$(dirname "$0")

SECRETS_PATH="${SCRIPT_DIR}/variables"

# Values
FOLDER_PATH="specs/platform-components"
CA_CERTS=$(npm config get cafile)

API_TOKEN="$1"
REPO_URL="$2"
PROJECT_ID="$3"

if [ -z "$API_TOKEN" ] || [ -z "$REPO_URL" ] || [ -z "$PROJECT_ID" ]; then

    read -sp "Enter your GitLab API token: " API_TOKEN
    echo

    read -sp "Enter the repo URL: " REPO_URL
    echo

    read -sp "Enter the project ID: " PROJECT_ID
    echo

fi

# Create the .env file with the input and hardcoded values
echo "API_TOKEN=$API_TOKEN" > "$SECRETS_PATH"
echo "PROJECT_ID=$PROJECT_ID" >> "$SECRETS_PATH"
echo "FOLDER_PATH=$FOLDER_PATH" >> "$SECRETS_PATH"
echo "REPO_URL=$REPO_URL" >> "$SECRETS_PATH"
echo "CA_CERTS=$CA_CERTS" >> "$SECRETS_PATH"

echo "✓✓✓✓✓ Variables file created at $SECRETS_PATH"
