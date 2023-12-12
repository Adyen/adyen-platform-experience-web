#!/bin/bash

# Define the path to the variables file
SCRIPT_DIR=$(dirname "$0")

SECRETS_PATH="${SCRIPT_DIR}/variables"

# Values
FOLDER_PATH="specs/platform-components"
CA_CERTS=$(npm config get cafile)

# Prompt for GitLab API token
read -sp "Enter your GitLab API token: " API_TOKEN
echo

# Prompt for repo URL in gitlab
read -sp "Enter the repo URL: " REPO_URL
echo

# Prompt for repo URL in gitlab
read -sp "Enter the project ID: " PROJECT_ID
echo


# Create the .env file with the input and hardcoded values
echo "API_TOKEN=$API_TOKEN" > "$SECRETS_PATH"
echo "PROJECT_ID=$PROJECT_ID" >> "$SECRETS_PATH"
echo "FOLDER_PATH=$FOLDER_PATH" >> "$SECRETS_PATH"
echo "REPO_URL=$REPO_URL" >> "$SECRETS_PATH"
echo "CA_CERTS=$CA_CERTS" >> "$SECRETS_PATH"

echo "✓✓✓✓✓ Variables file created at $SECRETS_PATH"
