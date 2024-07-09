#!/bin/bash

# Capture the new version from the first argument
new_version=$1

git push -u origin HEAD:bump/${new_version}