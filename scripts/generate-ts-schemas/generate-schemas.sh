#!/bin/bash
set -euo pipefail

EXCLUDED_RESOURCES=("PaymentInstrumentsResource")

# Get root dir of the project
SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT_DIR=$(realpath "$SCRIPT_DIR/../..")

# Schemas directory
SCHEMAS_DIR=$(realpath "$PROJECT_ROOT_DIR/packages/shared/types/src/api/resources")


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

export NODE_EXTRA_CA_CERTS="$CA_CERTS"

excluded_folders=()

for ((i=0; i<${#EXCLUDED_RESOURCES[@]}; i++)); do
  resource=${EXCLUDED_RESOURCES[i]}
  excluded_folders+=("$FOLDER_PATH/$resource")
done

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

# Extract folder paths
file_folders=()
while IFS= read -r line; do
    file_folders+=("$line")
done < <(echo "$response_body" | jq -r '.[] | select(.type == "tree") | .path')

# Loop over the array of folders
for folder in "${file_folders[@]}"; do

    if printf '%s\n' "${excluded_folders[@]}" | grep -Fqx "$folder"; then
      echo "$folder is excluded"
    else

      FOLDER_URL="https://$REPO_URL/api/v4/projects/$PROJECT_ID/repository/tree?path=${folder}&ref=$BRANCH_NAME"

      folder_response=$(curl -s -w "%{http_code}" --header "PRIVATE-TOKEN: $API_TOKEN" "$FOLDER_URL")
      folder_http_status="${folder_response:(-3)}"
      folder_response_body="${folder_response:0:${#folder_response}-3}"

      if [ "$folder_http_status" -ne 200 ]; then
          echo "Failed to fetch folder listing for $folder: $folder_response_body"
          exit 1
      fi

      files=()
      while IFS= read -r line; do
          files+=("$line")
      done < <(echo "$folder_response_body" | jq -r '.[] | select(.type == "blob") | .path')

      # Generate schemas for all versioned files, skip "latest"
      for file in "${files[@]}"; do
          if [[ $file == *"latest"* ]] || [[ $file != *.yaml && $file != *.json ]]; then
              continue
          fi

          base_name=$(basename "$file" | sed -E 's/\.(yaml|json)$//; s/-v([0-9]+)/V\1/g')
          ENCODED_FILE_PATH=$(urlencode "$file")
          FILE_URL="https://$REPO_URL/api/v4/projects/$PROJECT_ID/repository/files/$ENCODED_FILE_PATH/raw?ref=$BRANCH_NAME"

          curl -sSf --header "PRIVATE-TOKEN: $API_TOKEN" "$FILE_URL" | npx openapi-typescript -o "${SCHEMAS_DIR}/${base_name}.ts"
      done

    fi

done
