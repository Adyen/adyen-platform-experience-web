#!/bin/bash

# Find all .scss and .sass files and replace the variable pattern using sed
find . -type f \( -name "*.scss" -o -name "*.sass" \) -print0 | xargs -0 sed -i -E 's/\$color-([a-zA-Z0-9_-]+)/token(color-\1)/g'