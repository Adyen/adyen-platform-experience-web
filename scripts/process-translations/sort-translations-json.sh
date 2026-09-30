#!/usr/bin/env bash

# Terminal colors
LIGHT_RED='\033[1;31m'
LIGHT_BLUE='\033[1;34m'
NO_COLOR='\033[0m'

# Error token
ERROR_TOKEN="__ERROR__"

# Location of this script
SCRIPT_DIR=$(dirname "$0")

# JSON sorting script (binary)
sort_json=$(realpath "$SCRIPT_DIR/sort-json")

sort_translations_json() {
    # The path arrives as a single argument and is never interpolated into evaluated code, so
    # metacharacters in the file name cannot inject anything.
    local json_path=$(realpath -- "$1")

    if [[ ! -r "$json_path" ]]; then
        printf "${LIGHT_RED}(error) Missing translations JSON file${NO_COLOR}\n"
        return 1
    fi

    local sorted_json=$("$sort_json" < "$json_path" 2> /dev/null || echo "$ERROR_TOKEN")

    if [[ $sorted_json ]]; then
        if [[ $sorted_json == "$ERROR_TOKEN" ]]; then
            printf "${LIGHT_RED}(error) Malformed translations JSON file:${NO_COLOR}\n"
            printf "\t\t%s\n" "$json_path"
            return 1
        fi

        printf "${LIGHT_BLUE}(write) Updating translations JSON file:${NO_COLOR}\n"
        printf "\t\t%s\n" "$json_path"

        # overwrite the source translations JSON file with the correctly sorted JSON
        # printf prints the JSON verbatim; a shell whose echo expands backslash escapes would turn
        # `\n` inside translation values into raw newlines and corrupt the file.
        printf '%s\n' "$sorted_json" > "$json_path"

        # prettify the sorted source translations JSON file
        npx prettier --write "$json_path" 2> /dev/null
    fi
}

exit_code=0

for file_path; do
    # Sort each of the specified source translations JSON file
    if ! sort_translations_json "$file_path"; then
        exit_code=1
    fi
done

exit "$exit_code"
