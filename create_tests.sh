#!/bin/bash

# Directories to search
directories=(
    "src/hooks"
    "src/components/hooks"
    "src/components/utils"
    "src/components/internal"
)

# Find all .ts and .tsx files excluding test files and specific filenames
find "${directories[@]}" -type f \( -name "*.ts" -o -name "*.tsx" \) \
    ! -name "*.test.ts" \
    ! -name "*.test.tsx" \
    ! -name "types.ts" \
    ! -name "index.ts" \
    ! -name "index.tsx" \
    ! -name "constants.ts" \
    ! -name "constants.tsx" | while read -r filepath; do

    # Extract the directory and filename without extension
    filedir=$(dirname "$filepath")
    filename=$(basename "$filepath")
    filename_no_ext="${filename%.*}"
    extension="${filename##*.}"

    # Define the test file name, matching the extension
    test_file="$filedir/${filename_no_ext}.test.$extension"

    # Check if the test file already exists
    if [ ! -f "$test_file" ]; then
        # Calculate relative import path
        relative_path="./$filename"

        # Create the test file with the specified content
        cat > "$test_file" <<EOF
/**
 * @vitest-environment jsdom
 */
import { test } from 'vitest'
import { $filename_no_ext } from '$relative_path'

test('$filename_no_ext', () => {
    // Write your tests here
});
EOF
        echo "Created test file: $test_file"
    fi
done
