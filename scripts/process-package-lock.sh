#!/bin/bash

## Adyen may post-process node modules to additionally harden them and may host them separately.
## This script makes it possible to commit lockfiles under these conditions.
jq 'walk(if type == "object" and has("link") | not then del(.resolved?) else . end)' 'package-lock.json' | jq 'walk(del(.integrity?))' > tmp && mv tmp 'package-lock.json'
