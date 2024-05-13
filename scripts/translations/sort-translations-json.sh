#!/bin/sh

LIGHT_RED='\033[1;31m'
NO_COLOR='\033[0m'

# Root dir of the project
SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(realpath "$SCRIPT_DIR/../..")

# JSON sorting script (binary)
sort_json=$(realpath "$SCRIPT_DIR/sort-json")

sort_translations_json() {
    if [[ ! -r $1 ]]; then
        echo "${LIGHT_RED}(error) Missing source translations JSON file${NO_COLOR}"
        return 1
    fi

    local sorted_json=$($sort_json "$(cat $1)")

    if [[ $sorted_json != "" ]]; then
        # overwrite the source translations JSON file with the correctly sorted JSON
        echo $sorted_json > $1
    fi
}

for file_path in $@; do
    # Sort each of the specified source translations JSON file
    sort_translations_json $file_path
done
