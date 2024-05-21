#!/bin/bash

# Get root dir of the project
SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT_DIR=$(realpath "$SCRIPT_DIR/../..")

# Read version from package.json
PACKAGE_VERSION=$(jq -r '.apiVersion' "$PROJECT_ROOT_DIR/packages/lib/package.json")

# Schemas directory
SCHEMAS_DIR=$(realpath "$PROJECT_ROOT_DIR/packages/lib/src/types/models/openapi")


# Check if ./variables file exists, otherwise exit
if [ ! -f "$SCRIPT_DIR/variables" ]; then
    if [ "$npm_lifecycle_event" = "postinstall" ]; then
        echo "TS schemas were not generated"
        exit 1
    else
        bash "$SCRIPT_DIR/setup-openapi-ts.sh"
    fi
fi

# These variables are defined in ./variables
source "$SCRIPT_DIR/variables"

API_TOKEN="$API_TOKEN"
PROJECT_ID="$PROJECT_ID"
FOLDER_PATH="$FOLDER_PATH"
REPO_URL="$REPO_URL"
CA_CERTS="$CA_CERTS"

BRANCH_NAME="main"

# Function to URL-encode the folder path
urlencode() {
    echo -n "$1" | perl -MURI::Escape -ne 'print uri_escape($_)';
}

# Folders URL
GROUPS_URL="https://$REPO_URL/api/v4/projects/$PROJECT_ID/repository/tree?path=$FOLDER_PATH&ref=$BRANCH_NAME"

# Fetch the list of specs groups and store their paths in an array
response=$(curl -s -w "%{http_code}" --header "PRIVATE-TOKEN: $API_TOKEN" "$GROUPS_URL")
http_status="${response:(-3)}"
response_body="${response:0:${#response}-3}"

# Check if initial call succeeded
if [ "$http_status" -ne 200 ]; then
    echo "$response_body"
    exit 1
fi

# Extract folders and names
file_folders=($(echo "$response_body" | jq -r '.[] | select(.type == "tree") | .path'))
file_names=($(echo "$response_body" | jq -r '.[] | select(.type == "tree") | .name'))

# Loop over the array of folders
for ((i=0; i<${#file_folders[@]}; i++)); do

    FOLDER_URL="https://$REPO_URL/api/v4/projects/$PROJECT_ID/repository/tree?path=${file_folders[i]}&ref=$BRANCH_NAME"

    response=$(curl -s --header "PRIVATE-TOKEN: $API_TOKEN" "$FOLDER_URL")
    files=($(echo "$response" | jq -r '.[] | select(.type == "blob") | .path'))

    # Find correct version
    version_file_path=()
    for file in "${files[@]}"; do
        if [[ $file == *"$PACKAGE_VERSION"* ]]; then
            version_file_path+=("$file")
        fi
    done

    ENCODED_FOLDER_PATH=$(urlencode "$version_file_path")

    FILE_URL="https://$REPO_URL/api/v4/projects/$PROJECT_ID/repository/files/$ENCODED_FOLDER_PATH/raw?ref=$BRANCH_NAME"

    export NODE_EXTRA_CA_CERTS="$CA_CERTS"

    #Generate schemas
    npx openapi-typescript "$FILE_URL" -o "${SCHEMAS_DIR}/${file_names[i]}.ts" --header "PRIVATE-TOKEN: $API_TOKEN"

done
