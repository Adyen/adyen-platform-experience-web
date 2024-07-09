#!/bin/bash

# Capture the new version from the first argument
new_version=$1

git -u origin HEAD:bump/${version}