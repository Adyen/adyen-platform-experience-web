#!/bin/sh

# Terminal colors
LIGHT_RED='\033[1;31m'
LIGHT_BLUE='\033[1;34m'
NO_COLOR='\033[0m'

# Error token
ERROR_TOKEN="__ERROR__"

# Root dir of the project
SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/../..")

# JSON sorting script (binary)
sort_json=$(realpath "$SCRIPT_DIR/sort-json")

sort_translations_json() {
    local relative_path=$(node -e "console.log(require('node:path').relative('$(realpath "$PROJECT_ROOT")', '$(realpath "$1")'))")
    local json_path=$(realpath "$PROJECT_ROOT/$relative_path")

    if [[ ! -r $json_path ]]; then
        printf "${LIGHT_RED}(error) Missing translations JSON file${NO_COLOR}\n"
        return 1
    fi

    local sorted_json=$($sort_json "$(cat $json_path)" 2> /dev/null || echo $ERROR_TOKEN)

    if [[ $sorted_json ]]; then
        if [[ $sorted_json == $ERROR_TOKEN ]]; then
            printf "${LIGHT_RED}(error) Malformed translations JSON file:${NO_COLOR}\n"
            printf "\t\t$json_path\n"
            return 1
        fi

        printf "${LIGHT_BLUE}(write) Updating translations JSON file:${NO_COLOR}\n"
        printf "\t\t$json_path\n"

        # overwrite the source translations JSON file with the correctly sorted JSON
        echo "$sorted_json" > $json_path

        # prettify the sorted source translations JSON file
        npx prettier --write "$json_path" 2> /dev/null
    fi
}

for file_path; do
    # Sort each of the specified source translations JSON file
    sort_translations_json $file_path
done
