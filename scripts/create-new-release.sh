#!/bin/bash

options=("major" "minor" "patch")
current_index=0

display_options() {
  clear
  for i in "${!options[@]}"; do
    if [ $i -eq $current_index ]; then
      echo "\033[1;32m> ${options[$i]}\033[0m"
    else
      echo "  ${options[$i]}"
    fi
  done
}

# Function to handle keypresses
read_key() {
  read -sn1 key
  if [[ $key == $'\x1b' ]]; then
    read -sn2 key
    case "$key" in
      '[A') # Up arrow key
        ((current_index--))
        if [ $current_index -lt 0 ]; then
          current_index=$((${#options[@]} - 1))
        fi
        ;;
      '[B') # Down arrow key
        ((current_index++))
        if [ $current_index -ge ${#options[@]} ]; then
          current_index=0
        fi
        ;;
    esac
  elif [[ $key == "" ]]; then
    # Enter key
    return 1
  fi
  return 0
}

echo "Select release type:"
while true; do
    display_options
    read_key || break
done

release_type="${options[$current_index]}"

# Run release-it
npx release-it --ci --increment $release_type

echo "Version update completed successfully."

